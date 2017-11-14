import execa from 'execa'
import express from 'express'
import fs, { writeFileSync } from 'fs'
import bodyParser from 'body-parser'
import path from 'path'
import { v4 } from 'uuid'
import cors from 'cors'
import _ from 'lodash'

const app = express()
const PORT = process.env.PORT || 3000

app.set('port', PORT)

app.use(cors())
app.use(bodyParser.json({ limit: '50mb' }))

app.get('/', (req, res) => {
  res.send('Everything operating normally\n')
})

app.post('/merge', async (req, res, next) => {
  try {
    if (!_.isArray(req.body)) {
      return next({ message: 'Expected an array', status: 400 })
    }
    if (req.body.length < 2) {
      return next({
        message: `Expected at least 2 files to merge, got ${req.body.length}`,
        status: 400
      })
    }
    if (req.body.find(data => !_.isString(data))) {
      return next({
        message: 'Expected base64 strings on array elements',
        status: 400
      })
    }

    const files = req.body.map(b64 => {
      const name = `${v4()}.pdf`

      return {
        name,
        path: path.join('/', 'tmp', name),
        data: b64
      }
    })

    files.forEach(file => {
      writeFileSync(file.path, file.data, 'base64')
    })

    const outputPath = path.join('/', 'tmp', `OUTPUT-${v4()}.pdf`)

    // Example: pdft pdf1.pdf pdf2.pdf cat output out1.pdf
    const cmd = `pdftk ${files
      .map(f => f.path)
      .join(' ')} cat output ${outputPath}`

    await execa.shell(cmd)

    fs.readFile(outputPath, { encoding: 'base64' }, (err, data) => {
      // Remove files
      fs.unlink(outputPath, _.noop)
      files.forEach(f => fs.unlink(f.path, _.noop))

      res.status(200)
      res.send({ output: data })
    })
  } catch (err) {
    next(err)
  }
})

app.use((err, req, res, next) => {
  console.log(err.status ? '' : err)

  res.status(err.status || 500)
  res.send(err.message || 'Something went wrong')
})

app.listen(PORT)

console.log(`Running on port ${PORT}`)

export default app
