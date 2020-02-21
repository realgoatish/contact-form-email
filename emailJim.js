const aws = require('aws-sdk');
const ses = new aws.SES();
const emailJim = {};
const myEmail = process.env.EMAIL;
const myDomain = process.env.DOMAIN;

emailJim.send = async (event) => {
  try {
    const emailParams = emailJim.generateEmailParams(event.body)
    const data = await ses.sendEmail(emailParams).promise()
    return emailJim.generateResponse(200, data)
  } catch (err) {
    return emailJim.generateError(500, err)
  }
}

emailJim.generateResponse = (code, payload) => {
  return {
    statusCode: code,
    headers: {
      'Access-Control-Allow-Origin': myDomain,
      'Access-Control-Allow-Headers': 'x-requested-with',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify(payload)
  }
}

emailJim.generateError = (code, err) => {
  console.log(err)
  return {
    statusCode: code,
    headers: {
      'Access-Control-Allow-Origin': myDomain,
      'Access-Control-Allow-Headers': 'x-requested-with',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify(err.message)
  }
}

emailJim.generateEmailParams = body => {
  const { email, name, content } = JSON.parse(body)
  // console.log(email, name, content)
  if (!(email && name && content)) {
    throw new Error('Missing parameters! Make sure to add parameters \'email\', \'name\', \'content\'.')
  }

  return {
    Source: myEmail,
    Destination: { ToAddresses: [myEmail] },
    ReplyToAddresses: [email],
    Message: {
      Body: {
        Text: {
          Charset: 'UTF-8',
          Data: `Message sent from email ${email} by ${name} \nContent: ${content}`
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: `Message from ${name} via ${myDomain.substr(12)}`
      }
    }
  }
}

module.exports = emailJim;