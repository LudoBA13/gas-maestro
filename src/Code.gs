function doGet (e)
{
	return HtmlService.createHtmlOutputFromFile('Index')
		.setTitle('Gas Maestro - Configuration')
		.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getUserRepositories ()
{
	const props = PropertiesService.getUserProperties();
	const rawData = props.getProperty('BA_REPOSITORIES');
	
	if (rawData)
	{
		return JSON.parse(rawData);
	}
	
	return [];
}

function saveUserRepositories (repos)
{
	const props = PropertiesService.getUserProperties();
	props.setProperty('BA_REPOSITORIES', JSON.stringify(repos));
	return { success: true };
}

function getOrCreateAutoRepository ()
{
	const email = Session.getActiveUser().getEmail() || '';
	const match = email.match (/^(ba[0-9]+)\./i);
	
	if (!match)
	{
		throw new Error('User email not recognized for automatic repository generation (expected format: baXX.*)');
	}
	
	const baId = match[1].toLowerCase();
	const baName = baId.toUpperCase();
	
	const repos = getUserRepositories();
	const existing = repos.find(r => r.baId === baId);
	
	if (existing)
	{
		return existing;
	}
	
	const ss = SpreadsheetApp.create('BA Repository - ' + baName + ' (' + baId + ')');
	const spreadsheetId = ss.getId();
	
	try
	{
		Drive.Properties.insert({
			key: 'BA_REPOSITORY_ID',
			value: baId,
			visibility: 'PUBLIC'
		}, spreadsheetId);
	}
	catch (e)
	{
		try
		{
			const file = DriveApp.getFileById(spreadsheetId);
			file.setDescription('BA_REPOSITORY_ID: ' + baId);
		}
		catch (err)
		{
			// Ignore fallback failure
		}
	}
	
	const sheets = ss.getSheets();
	sheets.forEach(sheet =>
	{
		const protection = sheet.protect().setDescription('Prevent accidental modifications');
		protection.setWarningOnly(true);
	});
	
	const newRepo = { baId, baName, spreadsheetId };
	repos.push(newRepo);
	saveUserRepositories(repos);
	
	return newRepo;
}
