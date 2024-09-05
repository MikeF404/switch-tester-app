from app import app, db, Switch

def add_test_data():
    with app.app_context():
        switches = [
            Switch(name='Cherry MX Red', quantity=100),
            Switch(name='Gateron Brown', quantity=150),
            Switch(name='Kailh Box White', quantity=75)
        ]
        
        db.session.add_all(switches)
        db.session.commit()

if __name__ == '__main__':
    add_test_data()
    print("Test data added successfully!")