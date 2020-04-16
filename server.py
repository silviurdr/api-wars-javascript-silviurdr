from flask import Flask, request, render_template, redirect, session
import connection as con
import bcrypt
import json

app = Flask(__name__)

app.secret_key = b'-5#y2Y"F4Q8*\n\xec]/'


def hash_password(plain_text_password):
    # By using bcrypt, the salt is saved into the hash itself
    hashed_bytes = bcrypt.hashpw(plain_text_password.encode('utf-8'), bcrypt.gensalt())
    return hashed_bytes.decode('utf-8')


def verify_password(plain_text_password, hashed_password):
    hashed_bytes_password = hashed_password.encode('utf-8')
    return bcrypt.checkpw(plain_text_password.encode('utf-8'), hashed_bytes_password)


@app.route("/")
def home():
    if 'username' in session:
        login_username = session['username']
        return render_template('index.html', login_username=login_username)

    else:
        return render_template('index.html')


@app.route("/registration", methods=['GET', 'POST'])
def register():

    new_user = {}
    if request.method == "POST":
        already_registered = con.check_if_already_registered(request.form['username'])
        if already_registered is False:
            new_user['username'] = request.form['username']
            new_user['password'] = hash_password(request.form['password'])
            con.register(new_user)
            return render_template('index.html')
        else:
            username_used = "yes"
            return render_template('registration.html', username_used=username_used)

    return render_template('registration.html')


@app.route('/login', methods=['GET', 'POST'])
def login():

    login_try = {}
    is_member = False

    if request.method == 'POST':
        login_try['username'] = request.form['username']
        login_try['password'] = request.form['password']
        user = login_try['username']
        user_passsword_db = con.get_password_for_user(user)
        if user_passsword_db is not None:
            session['username'] = request.form['username']
            login_username = session['username']
            user_passsword_db = con.get_password_for_user(user)['password']
            is_member = verify_password(login_try['password'], user_passsword_db)
            if (is_member):
                return render_template('index.html', login_username=login_username)
        else:
            wrong_user = ""
            return render_template('login.html', wrong_user=wrong_user)

    return render_template('login.html')


@app.route('/logout')
def logout():
    session.pop('username', None)
    return redirect('/')


@app.route('/<planet>/vote', methods=['GET', 'POST'])
def voting(planet):

    if request.method == "POST":
        voted_planet = {}
        voted_planet['name'] = request.form['planet_name']
        planet_url = request.form['url']
        voted_planet['id'] = int(''.join([l for l in planet_url if l.isdigit()]))
        print(con.get_user_id_for_username(session['username']))
        user_id = con.get_user_id_for_username(session['username'])
        con.register_vote(voted_planet, user_id['user_id'])

    return redirect('/')


@app.route('/voting-stats')
def stats():

    voting_stats_json = con.get_vote_stats()
    return voting_stats_json


if __name__ == '__main__':
    app.run(
        debug=True,
        port=5000
    )