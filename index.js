let pug = require('pug')
let Prom = require('bluebird')

let dependency = require('node-rollout')
let rollout = null


let view = (req, res, next) => {
  res.status(200)
    .send(pug.renderFile('./views/index.pug', res.locals))
}


module.exports.client = (client) => {
  rollout = dependency(client)
  return (req, res, next) => {
    res.locals.rollout_flags = rollout.flags()
    Prom.all(res.locals.rollout_flags.map((flag) => {
      return rollout.mods(flag)
    })
    .then((mods) => {
      console.log(mods)
    })
    .finally(next)
  }
}
