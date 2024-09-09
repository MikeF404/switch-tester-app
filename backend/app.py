from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import IntegrityError
from flask_bcrypt import Bcrypt
from flask_cors import CORS
import jwt
from datetime import datetime, timedelta
import os
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

    def __repr__(self):
        return f'<Switch {self.name}>'

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(60), nullable=False)

class Session(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    token = db.Column(db.String(500), nullable=False)
    expiry = db.Column(db.DateTime, nullable=False)


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
        new_session = Session(user_id=user.id, token=token, expiry=datetime.utcnow() + timedelta(days=1))
        db.session.add(new_session)
        db.session.commit()
        return jsonify({"token": token}), 200
    return jsonify({"message": "Invalid credentials"}), 401

def token_required(f):
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({"message": "Token is missing"}), 401
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.get(data['user_id'])
            session = Session.query.filter_by(token=token, user_id=current_user.id).first()
            if not session or session.expiry < datetime.utcnow():
                return jsonify({"message": "Token is invalid or expired"}), 401
        except:
            return jsonify({"message": "Token is invalid"}), 401
        return f(current_user, *args, **kwargs)
    return decorated

def generate_token(user_id):
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(days=1)
    }
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')


@app.route('/protected', methods=['GET'])
@token_required
def protected(current_user):
    return jsonify({"message": f"Hello, {current_user.email}!"}), 200

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

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='127.0.0.1', port=5000, debug=True)