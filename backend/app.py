from functools import wraps
import uuid
from flask import Flask, request, jsonify, Blueprint
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import JSON, func
from sqlalchemy.exc import IntegrityError
from flask_bcrypt import Bcrypt
from flask_cors import CORS
import jwt
from datetime import datetime, timedelta, timezone
import os
import logging
from sqlalchemy.orm.attributes import flag_modified
import stripe
from werkzeug.exceptions import BadRequest
from dotenv import load_dotenv

load_dotenv()  # This loads the variables from .env file


app = Flask(__name__)

# Use environment variables for database configuration
db_user = os.getenv('DB_USER')
db_password = os.getenv('DB_PASSWORD')
db_host = os.getenv('DB_HOST')
db_port = os.getenv('DB_PORT')
db_name = os.getenv('DB_NAME')

# Construct the database URI using the environment variables
app.config['SQLALCHEMY_DATABASE_URI'] = f'postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
CORS(app, resources={r"/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"], "methods": ["GET", "POST", "DELETE", "OPTIONS"]}})

stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
# endpoint_secret = os.getenv('STRIPE_WEBHOOK_SECRET')

class Switch(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    brand = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(50), nullable=False)
    available = db.Column(db.Integer, nullable=False)
    force = db.Column(db.String(50), nullable=True)
    image = db.Column(db.String(255), nullable=True)

    def __repr__(self):
        return f'<Switch {self.brand} {self.name}>'

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'brand': self.brand,
            'type': self.type,
            'available': self.available,
            'force': self.force,
            'image': self.image
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
    cart_data = db.Column(db.JSON, nullable=False, default=list)
    last_updated = db.Column(db.DateTime(timezone=True), nullable=False, default=func.now(), onupdate=func.now())

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'cart_data': self.cart_data,
            'last_updated': self.last_updated.isoformat()
        }

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    name = db.Column(db.String(120), nullable=False)
    address = db.Column(db.String(255), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    zipcode = db.Column(db.String(20), nullable=False)
    order_details = db.Column(JSON, nullable=False)
    status = db.Column(db.String(50), nullable=False, default='pending')
    total_amount = db.Column(db.Integer, nullable=False)  # in cents
    stripe_payment_intent_id = db.Column(db.String(100), unique=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'address': self.address,
            'city': self.city,
            'zipcode': self.zipcode,
            'order_details': self.order_details,
            'status': self.status,
            'total_amount': self.total_amount,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
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
            
            if switch.available < quantity:
                return jsonify({"error": f"Not enough {switch_name} switches. Available: {switch.available}"}), 400
            
            switch.available -= quantity

        db.session.commit()
        return jsonify({"message": "Purchase successful"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/api/cart/add', methods=['POST'])
@token_required
def add_item_to_cart(current_user):
    data = request.json

    cart = Cart.query.filter_by(user_id=current_user.id).first()
    if not cart:
        cart = Cart(user_id=current_user.id, cart_data=[])
        db.session.add(cart)
    
    if cart.cart_data is None:
        cart.cart_data = []

    tester = {
        'id': str(uuid.uuid4()),
        'name': data['name'], 
        'size': data['size'],
        'keycaps': data['keycaps'],
        'switches': data['switches'],
        'price': data['price'],  
        'quantity': data['quantity']  
    }
    cart.cart_data.append(tester)
    
    # Mark the cart_data as modified
    flag_modified(cart, "cart_data")
    
    db.session.commit()

    return jsonify({'message': 'Item added to cart', 'cart_count': len(cart.cart_data)}), 201

@app.route('/api/cart/remove/<string:item_id>', methods=['DELETE'])
@token_required
def remove_item_from_cart(current_user, item_id):
    try:
        cart = Cart.query.filter_by(user_id=current_user.id).first()
        if not cart or not cart.cart_data:
            return jsonify({'message': 'Cart is empty'}), 404

        # Find the item with the matching ID
        cart.cart_data = [item for item in cart.cart_data if item.get('id') != item_id]
        
        # Mark the cart_data as modified
        flag_modified(cart, "cart_data")
        
        db.session.commit()

        return jsonify({'message': 'Item removed from cart', 'cart_count': len(cart.cart_data)}), 200
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error removing item from cart: {str(e)}")
        return jsonify({'message': 'An error occurred while removing the item from the cart'}), 500

@app.route('/api/cart', methods=['GET'])
@token_required
def get_user_cart(current_user):
    cart = Cart.query.filter_by(user_id=current_user.id).first()
    if not cart or not cart.cart_data:
        return jsonify({'message': 'Cart is empty', 'cart_data': []}), 200
    
    # Fetch switch names for all switches in the cart
    switch_ids = set(item['id'] for tester in cart.cart_data for item in tester['switches'])
    switches = {switch.id: switch.name for switch in Switch.query.filter(Switch.id.in_(switch_ids))}
    
    # Add switch names to the cart data
    for tester in cart.cart_data:
        for item in tester['switches']:
            item['name'] = switches.get(item['id'], 'Unknown Switch')
    
    return jsonify({'cart_data': cart.cart_data, 'cart_count': len(cart.cart_data)}), 200

@app.route('/api/cart/count', methods=['GET'])
@token_required
def get_user_cart_count(current_user):
    cart = Cart.query.filter_by(user_id=current_user.id).first()
    count = len(cart.cart_data) if cart and cart.cart_data else 0
    return jsonify({'cart_count': count}), 200

@app.route('/create-payment-intent', methods=['POST'])
@token_required
def create_payment_intent(current_user):
    try:
        data = request.json
        cart_data = data.get('cart_data')
        
        # Calculate the total amount
        total_amount = sum(item['price'] * item['quantity'] for item in cart_data)
        
        # Create a new order
        order = Order(
            user_id=current_user.id,
            email=data['email'],
            name=data['name'],
            address=data['address'],
            city=data['city'],
            zipcode=data['zipcode'],
            order_details=cart_data,
            total_amount=total_amount
        )
        db.session.add(order)
        db.session.commit()

        # Create a PaymentIntent with the order amount and currency
        intent = stripe.PaymentIntent.create(
            amount=total_amount,
            currency='usd',
            metadata={'order_id': order.id}
        )
        
        # Update the order with the PaymentIntent ID
        order.stripe_payment_intent_id = intent.id
        db.session.commit()

        return jsonify({
            'clientSecret': intent.client_secret,
            'publishableKey': os.getenv('STRIPE_PUBLISHABLE_KEY')
        })

    except Exception as e:
        return jsonify(error=str(e)), 400

@app.route('/webhook', methods=['POST'])
def webhook():
    event = None
    payload = request.data
    sig_header = request.headers['STRIPE_SIGNATURE']

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except ValueError as e:
        # Invalid payload
        raise BadRequest('Invalid payload')
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        raise BadRequest('Invalid signature')

    # Handle the event
    if event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']
        order_id = payment_intent['metadata']['order_id']
        
        # Update the order status
        order = Order.query.get(order_id)
        if order:
            order.status = 'paid'
            db.session.commit()
    
    elif event['type'] == 'payment_intent.payment_failed':
        payment_intent = event['data']['object']
        order_id = payment_intent['metadata']['order_id']
        
        # Update the order status
        order = Order.query.get(order_id)
        if order:
            order.status = 'failed'
            db.session.commit()

    # Add more event types as needed

    return jsonify(success=True)

@app.route('/api/hello', methods=['GET'])
def hello():
    return jsonify({'message': 'Hello, World!'}), 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='127.0.0.1', port=5000, debug=True)