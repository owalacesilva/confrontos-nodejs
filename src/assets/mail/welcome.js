/* PT-BR */
function ptbrSubject (ctx) {
  return `Seja bem-vindo!`
}

function ptbrContent (ctx) {
  return `
    Falaê, ${ctx.user.display_name}! Blz?<br /><br />
    Seu cadastro foi realizado com sucesso no app do confrontos<br /><br />
    Para acessar o app, baixe aqui: https://play.google.com/store/apps/details?id=com.confrontos<br />
    E-mail de acesso: ${ctx.user.email}<br />
    Senha de acesso: ${ctx.user.password}<br />    
    Att,<br /><br />
    Confrontos App
  `
}

const content = {
  'pt-br': {
    subject: ptbrSubject,
    content: ptbrContent
  }
}

export default content
