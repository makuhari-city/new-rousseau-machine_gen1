# coding: utf-8
from flask import Flask, render_template, url_for, request, abort
from itsdangerous import URLSafeTimedSerializer, SignatureExpired
import boto3

import urllib.request
import json
import urllib.parse
import hashlib

app = Flask(__name__)
app.config.from_pyfile('../config.cfg')
ses = boto3.client(
    'ses',
    aws_access_key_id=app.config['AWS_ACCESS_KEY_ID'],
    aws_secret_access_key=app.config['AWS_SECRET_ACCESS_KEY'],
    region_name=app.config['SES_REGION_NAME']
)

sender = app.config['SES_EMAIL_SOURCE']

s = URLSafeTimedSerializer('Thisisasecret!')

ipfs_url = 'http://ipfsapi:8080/'


@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'GET':
        return render_template("register.html")
    elif request.method == 'POST':
        email = request.form['email']
        token = s.dumps(email, salt='email-confirm')

        link = url_for('confirm_email', token=token, _external=True)

        ses.send_email(
            Source=sender,
            Destination={'ToAddresses': [email]},
            Message={
                'Subject': {'Data': 'Makuhari Citizen Verification'},
                'Body': {
                    'Text': {'Data': 'Hi,Its Makuhari City Hall.\n\nThis is a tiny note to let you know your temp code.\nUse the below url to verify that you own this email address.\n\nYour link is {} \n\nBye and have a nice day :)'.format(link)}
                }
            }
        )

        # return '<h1>The email you entered is {}. The token is {}</h1>'.format(email, token)
        return '<h1>the email you entered is {}. email sent for validation, check your inbox :)'.format(email)

    return abort(500, 'error.')


@app.route('/confirm_email/<token>', methods=['GET', 'POST'])
def confirm_email(token):
    email = ''
    try:
        email = s.loads(token, salt='email-confirm', max_age=600)
    except SignatureExpired:
        return '<h1>The token is expired!</h1>'
    if request.method == 'GET':

        return '<form action="/confirm_email/{}" method="POST"><input type="text" name="name" placeholder="your name"><input type="text" name="password" placeholder="your password"><input type="submit" value="activate"></form>'.format(token)
    elif request.method == 'POST':
        email_hash = hashlib.sha256(email.encode()).hexdigest()
        pass_hash = hashlib.sha256(request.form['password'].encode()).hexdigest()

        headers = {
            'Content-Type': 'application/json',
        }
        data = {'uid': email_hash,
                'name': request.form['name'], 
                'hash': pass_hash}
        json_data = json.dumps(data).encode("utf-8")

        print(json_data)
        req = urllib.request.Request(ipfs_url + 'citizen/', json_data, headers)
        response = urllib.request.urlopen(req)
        print(response.getcode())
        html = response.read()
        print(html.decode('utf-8'))
        # return html.decode('utf-8')

        return '<h1>Hello {}.</h1><h1>Citizen registration has been completed.</h1><h1>Welcome to Makuhari City!</h1>'.format(request.form['name'])
        # return '<h1>Your Makuhari citizen card has been issued.</h1>'.format(request.form['password'])

    return abort(500, 'error.')


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return render_template("login.html")
    elif request.method == 'POST':
        email_hash = email_hash = hashlib.sha256(request.form['email'].encode()).hexdigest()
        pass_hash = hashlib.sha256(request.form['password'].encode()).hexdigest()

        response = urllib.request.urlopen(ipfs_url + 'citizen/{}'.format(email_hash))
        # print(response.getcode())
        user_str = response.read()
        print(user_str.decode('utf-8'))
        user_json = json.loads(user_str)
        if(user_json['hash'] == pass_hash):
            return '<h1>Login completed</h1>'
        return '<h1>Your email address or login is incorrect.</h1>'
    return abort(500, 'error.')


# おまじない
if __name__ == "__main__":
    app.run(debug=True)
