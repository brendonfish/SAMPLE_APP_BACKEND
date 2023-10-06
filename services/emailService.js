var config = require('../config.json');
var AWS = require('aws-sdk');
var ses = new AWS.SES({endpoint: 'https://email.us-east-1.amazonaws.com', region:'us-east-1'});

function sendVerificationEmail(email, token, fn) {
	var subject = 'Welcome Email for ' + config.EXTERNAL_NAME;
	var verificationLink = config.VERIFICATION_PAGE + '?email=' + encodeURIComponent(email) + '&verify=' + token;
	ses.sendEmail({
		Source: config.EMAIL_SOURCE,
		Destination: {
			ToAddresses: [
				email
			]
		},
		Message: {
			Subject: {
				Data: subject
			},
			Body: {
				Html: {
					Data:'<html> '
+'                <header> '
+'                    <style> '
+'                    </style>'
+'                </header>'
+'                <body></body>'
+'                    <img src = "https://www.sample.com/images/welcome-mail.jpg" style="width:80%; height:auto; border:none;">'
+'                    <div style="width:80%;">'
+'                        <br>'
+'                        Greetings Adventurers, <br><br>'
+'                        Welcome to CarWink. By creating an account with us, you now can access our Emoji Creator. Currently, each member can submit up to 10 self-created emojis. <br><br>'
+'                        Click the link below to login and start creating.<br>'
+'                        <a href="https://members.sample.sample.com/creator/emoji">https://members.sample.sample.com/creator/emoji</a><br><br>'
+'                        Let’s work together to make our road a more enjoyable place!<br>'
+'                        Cheers!<br><br>'
+'                        '
+'                        Sincerely, <br>'
+'                        CarWink Team'
+'                    </div>'
+'                    <div>'
+'                        ------------------------------------------------------------------------------------'
+'                    </div>'
+'                        '
+'                    <div style="width:80%;">'
+'                            <br>'
+'                        利用者の皆様へ、<br><br>'
+'                        '
+'                        CarWinkへようこそ。 アカウントを登録すると、Emoji Creatorにアクセスできるようになります。 現在、メンバー1人につきオリジナルの絵文字を最大10個まで作成できます。<br><br>'
+'                        '
+'                        以下のリンクをクリックすると、ログインして。絵文字の作成を始めましょう。<br>'
+'                        <a href="https://members.sample.sample.com/creator/emoji">https://members.sample.sample.com/creator/emoji</a>'
+'                 <br><br>        '
+'                        一緒に道路を楽しい場所にしていきましょう。　　<br><br>'
+'                        '
+'                        よろしくお願いします。<br>'
+'                        CarWinkスタッフ一同'
+'                    </div>'
+'                '
+'                    <div>'
+'                        ------------------------------------------------------------------------------------'
+'                    <div style="width:80%;">'
+'                        <br>'
+'                        親愛的用戶您好：<br><br>'
+'                        '
+'                        歡迎使用CarWink！透過您已建立的CarWink帳號，您現在也可以體驗Emoji Creator 線上編輯平台了！每位會員可上傳至十組的自創表情符號。<br><br>'
+'                        '
+'                        請點進以下網址並成功登入後，就可以開始編輯囉！<br>'
+'                        <a href="https://members.sample.sample.com/creator/emoji">https://members.sample.sample.com/creator/emoji</a>'
+'                 <br><br>        '
+'                        讓CarWink 陪伴您一起，讓道路成為一個友善舒心的空間吧！<br>'
+'                        CarWink 團隊'
+'                    </div>'
+'                    <div>'
+'                            ------------------------------------------------------------------------------------'
+'                    </div>'
+'                </body>'
+'                '
+'                '
+'                </html>'
				}
			}
		}
	}, fn);
}

function sendLostPasswordEmail(email, token, fn) {
	var subject = 'Password Lost for ' + config.EXTERNAL_NAME;
	var lostLink = config.RESET_PAGE + '?email=' + encodeURIComponent(email) + '&lost=' + token;

	ses.sendEmail({
		Source: config.EMAIL_SOURCE,
		Destination: {
			ToAddresses: [
				email
			]
		},
		Message: {
			Subject: {
				Data: subject
			},
			Body: {
				Html: {
					Data: '<html><head>'
					+ '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />'
					+ '<title>' + subject + '</title>'
					+ '</head><body>'
					+ 'Please <a href="' + lostLink + '">click here to reset your password</a> or copy & paste the following link in a browser:'
					+ '<br><br>'
					+ '<a href="' + lostLink + '">' + lostLink + '</a>'
					+ '</body></html>'
				}
			}
		}
	}, fn);
}

module.exports = {
	sendVerificationEmail: sendVerificationEmail,
	sendLostPasswordEmail: sendLostPasswordEmail
}