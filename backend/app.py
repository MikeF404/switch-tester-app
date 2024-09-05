from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import IntegrityError

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://mike-f:@localhost:5432/switch_tester_app_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class Switch(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    quantity = db.Column(db.Integer, nullable=False)

    def __repr__(self):
        return f'<Switch {self.name}>'

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
    app.run(debug=True)