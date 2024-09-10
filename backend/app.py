from functools import wraps
from flask import Flask, request, jsonify, Blueprint
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import JSON
from sqlalchemy.exc import IntegrityError
from flask_bcrypt import Bcrypt
from flask_cors import CORS
import jwt
from datetime import datetime, timedelta, timezone
import os
import logging


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://mike-f:@localhost:5432/switch_tester_app_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key') 
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
CORS(app, resources={r"/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}})

class Switch(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    force = db.Column(db.String(50), nullable=True)
    type = db.Column(db.String(50), nullable=True)
    icon_path = db.Column(db.String(255), nullable=True)

    def __repr__(self):
        return f'<Switch {self.name}>'

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'quantity': self.quantity,
            'force': self.force,
            'type': self.type,
            'icon_path': self.icon_path
        }

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(60), nullable=False)

class Session(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    token = db.Column(db.String(500), nullable=False)
    expiry = db.Column(db.DateTime(timezone=True), nullable=False)

    def __init__(self, user_id, token, expiry):
        self.user_id = user_id
        self.token = token
        self.expiry = expiry.replace(tzinfo=timezone.utc) if expiry.tzinfo is None else expiry

class Cart(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    cart_data = db.Column(JSON, nullable=False, default=list)
    last_updated = db.Column(db.DateTime, nullable=False, default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))

    def __repr__(self):
        return f'<Cart {self.id} for User {self.user_id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'cart_data': self.cart_data,
            'last_updated': self.last_updated.isoformat()
        }
    
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"message": "Email already registered"}), 400
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    new_user = User(email=data['email'], password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User registered successfully"}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    if user and bcrypt.check_password_hash(user.password, data['password']):
        token = generate_token(user.id)
        expiry = datetime.now(timezone.utc) + timedelta(days=1)
        new_session = Session(user_id=user.id, token=token, expiry=expiry)
        db.session.add(new_session)
        db.session.commit()
        return jsonify({"token": token}), 200
    return jsonify({"message": "Invalid credentials"}), 401

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            logging.error("Token is missing")
            return jsonify({"message": "Token is missing"}), 401
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = db.session.get(User, data['user_id'])
            if not current_user:
                logging.error(f"User not found for user_id: {data['user_id']}")
                return jsonify({"message": "User not found"}), 401
            session = Session.query.filter_by(token=token, user_id=current_user.id).first()
            if not session:
                logging.error(f"No session found for user_id: {current_user.id}")
                return jsonify({"message": "No valid session found"}), 401
            if session.expiry < datetime.now(timezone.utc):
                logging.error(f"Token expired for user_id: {current_user.id}")
                return jsonify({"message": "Token has expired"}), 401
        except jwt.ExpiredSignatureError:
            logging.error("Token has expired")
            return jsonify({"message": "Token has expired"}), 401
        except jwt.InvalidTokenError as e:
            logging.error(f"Invalid token: {str(e)}")
            return jsonify({"message": "Invalid token"}), 401
        except Exception as e:
            logging.error(f"Unexpected error in token validation: {str(e)}")
            return jsonify({"message": "Token is invalid"}), 401
        return f(current_user, *args, **kwargs)
    return decorated

def generate_token(user_id):
    payload = {
        'user_id': user_id,
        'exp': datetime.now(timezone.utc) + timedelta(days=1)
    }
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')


@app.route('/protected', methods=['GET'])
@token_required
def protected(current_user):
    return jsonify({"message": f"Hello, {current_user.email}!"}), 200


@app.route('/switches', methods=['GET'])
def get_switches():
    switches = Switch.query.all()
    return jsonify([switch.to_dict() for switch in switches])

@app.route('/purchase', methods=['POST'])
def purchase_switches():
    switches_to_purchase = request.json
    
    if not switches_to_purchase:
        return jsonify({"error": "No switches provided"}), 400

    try:
        for switch_name, quantity in switches_to_purchase.items():
            switch = Switch.query.filter_by(name=switch_name).first()
            
            if not switch:
                return jsonify({"error": f"Switch {switch_name} not found"}), 404
            
            if switch.quantity < quantity:
                return jsonify({"error": f"Not enough {switch_name} switches. Available: {switch.quantity}"}), 400
            
            switch.quantity -= quantity

        db.session.commit()
        return jsonify({"message": "Purchase successful"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/api/cart', methods=['GET'])
@token_required
def get_user_cart(current_user):
    cart = Cart.query.filter_by(user_id=current_user.id).first()
    if not cart or not cart.cart_data:
        return jsonify({'message': 'Cart is empty'}), 200
    
    # Fetch switch names for all switches in the cart
    switch_ids = set(item['id'] for tester in cart.cart_data for item in tester['switches'])
    switches = {switch.id: switch.name for switch in Switch.query.filter(Switch.id.in_(switch_ids))}
    
    # Add switch names to the cart data
    for tester in cart.cart_data:
        for item in tester['switches']:
            item['name'] = switches.get(item['id'], 'Unknown Switch')
    
    return jsonify(cart.to_dict()), 200

@app.route('/api/cart/add', methods=['POST'])
@token_required
def add_item_to_cart(current_user):
    data = request.json

    cart = Cart.query.filter_by(user_id=current_user.id).first()
    if not cart:
        cart = Cart(user_id=current_user.id, cart_data=[])
        db.session.add(cart)

    tester = {
        'size': data['size'],
        'keycaps': data['keycaps'],
        'switches': data['switches']
    }
    cart.cart_data.append(tester)
    db.session.commit()

    return jsonify({'message': 'Item added to cart', 'cart_count': len(cart.cart_data)}), 201

@app.route('/api/cart/count', methods=['GET'])
@token_required
def get_user_cart_count(current_user):
    cart = Cart.query.filter_by(user_id=current_user.id).first()
    count = len(cart.cart_data) if cart else 0
    return jsonify({'cart_count': count}), 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='127.0.0.1', port=5000, debug=True)