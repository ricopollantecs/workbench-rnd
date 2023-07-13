const update = document.getElementById('progress-bar')

window.electronAPI.handleUpdate((event, value) => {
  update.style.width = value*100+"%"
  console.log(value+ ' rcvd');
  console.log('callback')
 event.sender.send('update-value', value) //send back data to main
})
