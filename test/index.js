import app from '../src/index'
import test from 'ava'
import axios from 'axios'
import fs from 'fs'

test.before(async t => {
  axios.defaults.validateStatus = status => true
  axios.defaults.baseURL = `http://localhost:${app.get('port')}`
})

test('must work', async t => {
  const files = [
    fs.readFileSync(`${__dirname}/fixture/1.pdf`, { encoding: 'base64' }),
    fs.readFileSync(`${__dirname}/fixture/2.pdf`, { encoding: 'base64' })
  ]

  const { data, status } = await axios.post('/merge', files)

  t.is(status, 200)
  t.is(typeof data, 'string')
})

test('must be an array', async t => {
  const { status } = await axios.post('/merge', {})

  t.is(status, 400)
})

test('must be an array of strings', async t => {
  const { status } = await axios.post('/merge', ['123', {}])

  t.is(status, 400)
})

test('must have two files minimum', async t => {
  const { status } = await axios.post('/merge', ['abc'])

  t.is(status, 400)
})
