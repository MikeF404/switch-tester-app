from app import app, db, Switch

def add_test_data():
    with app.app_context():
        switches = [
            Switch(name='Outemu Lemon', quantity=70, type='tactile', force='55g', icon_path='https://placeholder.com/150'),
            Switch(name='Akko V3 Cream Blue Pro', quantity=45, type='tactile', force='55g', icon_path='https://placeholder.com/150'),
            Switch(name='Akko V3 Penguin Pro', quantity=45, type='tactile', force='55g', icon_path='https://placeholder.com/150'),
            Switch(name='Akko V3 Creamy Purple Pro', quantity=45, type='tactile', force='55g', icon_path='https://placeholder.com/150'),
            Switch(name='Akko Rosewood Pro', quantity=45, type='linear', force='55g', icon_path='https://placeholder.com/150'),
            Switch(name='Akko Lavander Purple V3 Pro', quantity=45, type='tactile', force='55g', icon_path='https://placeholder.com/150')
        ]
        
        db.session.add_all(switches)
        db.session.commit()

if __name__ == '__main__':
    add_test_data()
    print("Test data added successfully!")