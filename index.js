var express = require('express')
let pug = require('pug')
let Prom = require('bluebird')
var router = express.Router()

let rollout = null

let utils = {
  formatFlag: (name) => {
    return name.replace(/_/g, ' ').replace(/\b(\w)/g, (_, letter) => {
      return letter.toUpperCase()
    })
  }
}

router.get('/', populate, (req, res, next) => {
  res.status(200)
    .send(pug.renderFile(`${__dirname}/views/index.pug`, res.locals))
})

router.put('/', populate, (req, res, next) => {
  let body = JSON.parse(req.body.data)
  let update = {}
  update[body.mod] = body.val
  rollout.update(body.flag, update)
  .finally(() => {
    return res.status(201).json({
      ok: true
    })
  })
})

function populate(req, res, next) {
  res.locals.utils = utils
  let flags = res.locals.rollout_flags = rollout.flags()
  let all = {}
  Prom.all(res.locals.rollout_flags.map((flag) => {
    return rollout.mods(flag)
  }))
  .then((mods) => {
    mods.forEach((mod, i) => {
      all[flags[i]] = mod
    })
    res.locals.all_mods = all
  })
  .finally(next)
}

module.exports.client = (client) => {
  rollout = client
  return router
}
