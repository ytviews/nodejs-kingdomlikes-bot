const consoleMessage = require('../../utils/consoleMessage.js');
const checkAvailability = require('./checkAvailability');
const getUserPoints = require('./getUserPoints');
const getVideoName = require('./getVideoName');
const getVideoPoints = require('./getVideoPoints');
const noPointsFoundTolerance = require('./noPointsFoundTolerance');

async function videosViewsHandler(page, selectors) {
    consoleMessage('header', 'VIDEOS VIEWS HANDLER', true)
    const { playvideoBtn, userPoints } = selectors;
    let rightnow = new Date();

    let isThereAVideo = await checkAvailability(page, playvideoBtn);
    let sleepForFiveMins = isThereAVideo ? false : new Date(rightnow.getTime() + 10*60000); 


    let videoNumber = 0;
    let noPointsFound = 0;
    
    setInterval(async function() {
      rightnow = new Date();
      if(!sleepForFiveMins || (sleepForFiveMins && rightnow > sleepForFiveMins)) {
        
        const btnNotDisabled = await page.$('button.blue[disabled]') === null;
      
        if(btnNotDisabled) {
          const userPnts = await getUserPoints(page, userPoints)
          consoleMessage('info', `User Points: ${userPnts}`)
          consoleMessage('header', 'Handling new video...')

          videoNumber += 1;
          consoleMessage('info', `Clicking on youtube video number ${videoNumber}`)
    
          const vdName = await getVideoName(page)
          consoleMessage('info', `----> Video Name: ${vdName ? vdName : 'No name'}`)
    
          const vdPoints = await getVideoPoints(page)
          if (vdPoints) {
            noPointsFound = 0;
            consoleMessage('info', `----> Video Points: ${vdPoints}`)
    
            await page.click(playvideoBtn)
            consoleMessage('info', 'Playing video for 1:40 minutes')
          } else { 
            noPointsFound += 1;
            noPointsFoundTolerance(noPointsFound)

            try {
              await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
            } catch { navigationFailure('reloading ytviews')}
    
            sleepForFiveMins = await checkAvailability(page, playvideoBtn) ? false : new Date(rightnow.getTime() + 10*60000); 
          }
        }
      }
    }, 20000);
}

module.exports = videosViewsHandler