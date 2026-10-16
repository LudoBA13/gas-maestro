function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Gas Maestro - Configuration')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getUserRepositories() {
  const props = PropertiesService.getUserProperties();
  const rawData = props.getProperty('BA_REPOSITORIES');
  return rawData ? JSON.parse(rawData) : [];
}

function saveUserRepositories(repos) {
  const props = PropertiesService.getUserProperties();
  props.setProperty('BA_REPOSITORIES', JSON.stringify(repos));
  return { success: true };
}

function createAndTagRepository(baId, baName) {
  const ss = SpreadsheetApp.create(`BA Repository - ${baName} (${baId})`);
  const spreadsheetId = ss.getId();
  
  try {
    Drive.Properties.insert({
      key: 'BA_REPOSITORY_ID',
      value: baId,
      visibility: 'PUBLIC'
    }, spreadsheetId);
  } catch (e) {
    try {
      const file = DriveApp.getFileById(spreadsheetId);
      file.setDescription(`BA_REPOSITORY_ID: ${baId}`);
    } catch (err) {
      // Ignore fallback failure
    }
  }
  
  const sheets = ss.getSheets();
  sheets.forEach(sheet => {
    const protection = sheet.protect().setDescription('Prévention des modifications accidentelles');
    protection.setWarningOnly(true);
  });
  
  const newRepo = { baId, baName, spreadsheetId };
  const repos = getUserRepositories();
  repos.push(newRepo);
  saveUserRepositories(repos);
  
  return newRepo;
}
