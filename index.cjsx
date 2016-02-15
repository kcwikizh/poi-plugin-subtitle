{_, SERVER_HOSTNAME} = window
Promise = require 'bluebird'
async = Promise.coroutine
PLUGIN_VERSION = '0.0.1'
webview = $('kan-game webview')
shipgraph = {}
voiceMap = {}
voiceKey = [2475, 1555, 3347, 8691, 7847, 3595, 1767, 3311, 2507, 9651, 5321, 4473, 7117, 5947, 9489, 2669, 8741, 6149, 1301, 7297, 2975, 6413, 8391, 9705, 2243, 2091, 4231, 3107, 9499, 4205, 6013, 3393, 6401, 6985, 3683, 9447, 3287, 5181, 7587, 9353, 2135, 4947, 5405, 5223, 9457, 5767, 9265, 8191, 3927, 3061, 2805, 3273, 7331]
convertFilename = (shipId, voiceId) ->
  # Kadokawa doesn't provide repair voice any more. We need to use the old.
  return voiceId if voiceId in [6]
  return (shipId + 7) * 17 * voiceKey[voiceId - 1] % 99173 + 100000
voiceMap[convertFilename(275,i)] = i for i in [1..voiceKey.length]

if config.get('plugin.Subtitle.enable', true)
  reportInit()
  window.addEventListener 'game.response', (e) ->
    {method, path, body, postBody} = e.detail
    {_ships, _decks, _teitokuLv} = window
    switch path
      when '/kcsapi/api_start2'
        shipgraph[ship.api_id] = ship.api_filename for ship in body.api_mst_shipgraph
        console.log JSON.stringify shipgraph
    return
  webview.addEventListener 'did-get-response-details', (e) ->
    match = /kcs\/sound\/kc(.*?)\/(.*?).mp3/.exec(e.newURL)
    return if not match? or match.length < 3
    [..., shipCode, fileName] = match
    # window.log '长门：嗯、怎…不，不是…并不是讨厌…' if e.newURL.indexOf('111994.mp3') >=0
    console.log shipCode
    console.log fileName
    console.log voiceMap[fileName] if shipCode == 'szgthkexanxl'
    return
module.exports =
  name: 'Subtitle'
  author: [<a key={0} href="https://github.com/grzhan">grzhan</a>]
  displayName: <span><FontAwesome key={0} name='microphone' /> 语音字幕</span>
  description: '舰娘语音字幕插件'
  show: false
  version: PLUGIN_VERSION
