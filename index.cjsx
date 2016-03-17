{_, SERVER_HOSTNAME} = window
Promise = require 'bluebird'
path = require 'path'
fs = Promise.promisifyAll require 'fs-extra'
webview = $('kan-game webview')
shipgraph = {}
voiceMap = {}
voiceKey = [604825,607300,613847,615318,624009,631856,635451,637218,640529,643036,652687,658008,662481,669598,675545,685034,687703,696444,702593,703894,711191,714166,720579,728970,738675,740918,743009,747240,750347,759846,764051,770064,773457,779858,786843,790526,799973,803260,808441,816028,825381,827516,832463,837868,843091,852548,858315,867580,875771,879698,882759,885564,888837,896168]
convertFilename = (shipId, voiceId) ->
  return (shipId + 7) * 17 * (voiceKey[voiceId] - voiceKey[voiceId - 1]) % 99173 + 100000
for shipNo in [1..500]
  voiceMap[shipNo] = {}
  voiceMap[shipNo][convertFilename(shipNo,i)] = i for i in [1..voiceKey.length]
subtitles = {}
subtitlesFile = path.join __dirname, 'subtitles.json'
fs.readFileAsync subtitlesFile, (err, data) ->
  subtitles = JSON.parse data unless err?
  console.log 'Subtitles.json is not exist' if err?.code is 'ENOENT'
  console.error err.code if err?.code isnt 'ENOENT' and err?.code

handleGameResponse = (e) ->
    {method, path, body, postBody} = e.detail
    {_ships, _decks, _teitokuLv} = window
    switch path
      when '/kcsapi/api_start2'
        shipgraph[ship.api_filename] = ship.api_id for ship in body.api_mst_shipgraph
        # Adjust animation duation
        $('poi-alert #alert-area')?.style?.animationDuration="20s"
    return

handleGetResponseDetails = (e) ->
  prior = 5
  match = /kcs\/sound\/kc(.*?)\/(.*?).mp3/.exec(e.newURL)
  return if not match? or match.length < 3
  console.log e.newURL if process.env.DEBUG
  [..., shipCode, fileName] = match
  apiId = shipgraph[shipCode]
  return if not apiId
  voiceId = voiceMap[apiId][fileName]
  return if not voiceId
  console.log "#{apiId} #{voiceId}" if process.env.DEBUG
  subtitle = subtitles[apiId]?[voiceId]
  prior = 0 if 8 < voiceId < 11
  if subtitle
    window.log "#{$ships[apiId].api_name}：#{subtitle}",
      priority : prior,
      stickyFor: 5000
  else
    window.log "本【#{$ships[apiId].api_name}】的台词字幕缺失的说，来舰娘百科（http://zh.kcwiki.moe/）帮助我们补全台词吧！",
      priority : prior,
      stickyFor: 5000
  return

module.exports =
  show: false
  pluginDidLoad: (e) ->
    window.addEventListener 'game.response', handleGameResponse
    window.addEventListener 'did-get-response-details', handleGetResponseDetails
  pluginWillLoad: (e) ->
    window.removeEventListener 'game.response', handleGameResponse
    window.removeEventListener 'did-get-response-details', handleGetResponseDetails
