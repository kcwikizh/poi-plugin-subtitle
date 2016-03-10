{_, SERVER_HOSTNAME} = window
Promise = require 'bluebird'
path = require 'path'
async = Promise.coroutine
fs = Promise.promisifyAll require 'fs-extra'
PLUGIN_VERSION = '0.1.2'
webview = $('kan-game webview')
shipgraph = {}
voiceMap = {}
voiceKey = [2475, 1555, 3347, 8691, 7847, 3595, 1767, 3311, 2507, 9651, 5321, 4473, 7117, 5947, 9489, 2669, 8741, 6149, 1301, 7297, 2975, 6413, 8391, 9705, 2243, 2091, 4231, 3107, 9499, 4205, 6013, 3393, 6401, 6985, 3683, 9447, 3287, 5181, 7587, 9353, 2135, 4947, 5405, 5223, 9457, 5767, 9265, 8191, 3927, 3061, 2805, 3273, 7331]
convertFilename = (shipId, voiceId) ->
  # Kadokawa doesn't provide repair voice any more. We need to use the old.
  return voiceId if voiceId in [6]
  return (shipId + 7) * 17 * voiceKey[voiceId - 1] % 99173 + 100000
for shipNo in [1..500]
  voiceMap[shipNo] = {}
  voiceMap[shipNo][convertFilename(shipNo,i)] = i for i in [1..voiceKey.length]
subtitles = {}
subtitlesFile = path.join __dirname, 'subtitles.json'
fs.readFileAsync subtitlesFile, (err, data) ->
  subtitles = JSON.parse data unless err?
  console.log 'Subtitles.json is not exist' if err?.code is 'ENOENT'
  console.error err.code if err?.code isnt 'ENOENT' and err?.code

if config.get('plugin.Subtitle.enable', true)
  window.addEventListener 'game.response', (e) ->
    {method, path, body, postBody} = e.detail
    {_ships, _decks, _teitokuLv} = window
    switch path
      when '/kcsapi/api_start2'
        shipgraph[ship.api_filename] = ship.api_id for ship in body.api_mst_shipgraph
    return
  webview.addEventListener 'did-get-response-details', (e) ->
    match = /kcs\/sound\/kc(.*?)\/(.*?).mp3/.exec(e.newURL)
    return if not match? or match.length < 3
    [..., shipCode, fileName] = match
    apiId = shipgraph[shipCode]
    return if not apiId
    voiceId = voiceMap[apiId][fileName]
    return if not voiceId
    subtitle = subtitles[apiId]?[voiceId]
    if subtitle
      window.log "#{$ships[apiId].api_name}：#{subtitle}",
        priority : 5,
        stickyFor: 5000
    else
      window.log "本【#{$ships[apiId].api_name}】的台词字幕缺失的说，来舰娘百科（http://zh.kcwiki.moe/）帮助我们补全台词吧！"
    return

module.exports =
  name: 'Subtitle'
  author: [<a key={0} href="https://github.com/grzhan">grzhan</a>]
  displayName: <span><FontAwesome key={0} name='microphone' /> kcwiki语音字幕</span>
  description: '语音字幕插件（舰娘百科支持）'
  show: false
  version: PLUGIN_VERSION