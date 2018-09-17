import fs from 'fs'
import papercut from 'papercut'
import { ip, port, root } from './../../config'

const AvatarUploader = papercut.Schema(function(schema) {
  schema.version({
    name: 'origin',
    process: 'copy'
  })

  schema.version({
    name: 'md',
    size: '200x200',
    process: 'crop'
  })

  schema.version({
    name: 'sm',
    size: '50x50',
    process: 'crop'
  })
})

papercut.configure(function(){
  papercut.set('storage', 'file')
  papercut.set('directory', `${root}/public/uploads`)
  papercut.set('url', `http://${ip}:${port}/uploads`)
  papercut.set('extension', 'png')
});

const uploader = (body) => (team) => {
  if (team && body.picture && typeof body.picture === 'object') {
    const { data } = body.picture
    const uploader = new AvatarUploader()
    
    var buffer = Buffer(data, 'base64')
    var time = new Date().getTime()
    var tmpFilename = `/tmp/${time.id}.png`
    fs.writeFileSync(tmpFilename, buffer)
  
    uploader.process(team.slug, tmpFilename, (err, images) => {
      team.pictures = images
      team.save()
    })
  }
  
  return team
}

export default uploader
