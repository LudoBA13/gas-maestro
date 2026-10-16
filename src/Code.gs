function doGet (e)
{
	return HtmlService.createHtmlOutputFromFile('Index')
		.setTitle('Maestro - Configuration')
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

function getCurrentUserEmail ()
{
	return Session.getActiveUser().getEmail() || 'Unknown user';
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
	let repo = repos.find(r => r.baId === baId);
	
	if (repo)
	{
		return repo;
	}
	
	// Search Google Drive for existing repository with matching BA_REPOSITORY_ID property
	try
	{
		const query = 'properties has { key=\'BA_REPOSITORY_ID\' and value=\'' + baId + '\' and visibility=\'PUBLIC\' } and trashed = false';
		const result = Drive.Files.list({ q: query });
		
		if (result && result.items && result.items.length > 0)
		{
			const fileItem = result.items[0];
			repo = {
				baId: baId,
				baName: baName,
				spreadsheetId: fileItem.id
			};
			repos.push(repo);
			saveUserRepositories(repos);
			return repo;
		}
	}
	catch (e)
	{
		try
		{
			const files = DriveApp.searchFiles('trashed = false');
			while (files.hasNext())
			{
				const file = files.next();
				if (file.getName().toLowerCase().includes(baId) || file.getDescription().includes(baId))
				{
					repo = {
						baId: baId,
						baName: baName,
						spreadsheetId: file.getId()
					};
					repos.push(repo);
					saveUserRepositories(repos);
					return repo;
				}
			}
		}
		catch (err)
		{
			// Ignore search fallback failure and proceed to creation
		}
	}
	
	// If still not found, create a new repository spreadsheet
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
	
	repo = { baId, baName, spreadsheetId };
	repos.push(repo);
	saveUserRepositories(repos);
	
	return repo;
}
