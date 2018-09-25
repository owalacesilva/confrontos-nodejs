import * as mailer from '.'
import mailTemp from './../../assets/mail/welcome'
import { User } from './../../api/user'

let user;

beforeEach(async () => {
  user = await User.create({ 
    display_name: 'Walace user', 
    gender: 'male', 
    email: 'wsilva.emp@gmail.com', 
    password: '123456' 
  })
})

it('testing send email', async () => {
  const response = await mailer.sendMail({
    name: user.display_name, 
    email: user.email, 
    subject: mailTemp['pt-br'].subject({
      user: user
    }),
    content: mailTemp['pt-br'].content({
      user: user
    })
  })
  expect(response).toBeTruthy()
})