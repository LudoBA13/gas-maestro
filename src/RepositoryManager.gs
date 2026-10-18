/**
 * RepositoryManager class
 * Handles creation and management of BA repository Google Sheets.
 */
Maestro.RepositoryManager = class RepositoryManager
{
	static createRepository (baId, baName)
	{
		const normalizedBaId = baId.toLowerCase();
		const resolvedBaName = baName ? baName.toUpperCase() : normalizedBaId.toUpperCase();
		
		const ss = SpreadsheetApp.create('BA Repository - ' + resolvedBaName + ' (' + normalizedBaId + ')');
		const spreadsheetId = ss.getId();
		
		// Tag file with BA_REPOSITORY_ID property
		try
		{
			Drive.Properties.insert
			({
				key: 'BA_REPOSITORY_ID',
				value: normalizedBaId,
				visibility: 'PUBLIC'
			}, spreadsheetId);
		}
		catch (e)
		{
			try
			{
				const file = DriveApp.getFileById(spreadsheetId);
				file.setDescription('BA_REPOSITORY_ID: ' + normalizedBaId);
			}
			catch (err)
			{
				// Ignore fallback description failure
			}
		}
		
		// Initialize Parameters sheet
		const sheets = ss.getSheets();
		let parametersSheet;
		
		if (sheets.length > 0)
		{
			parametersSheet = sheets[0];
			parametersSheet.setName('Parameters');
		}
		else
		{
			parametersSheet = ss.insertSheet('Parameters');
		}
		
		parametersSheet.clear();
		parametersSheet.appendRow(['Key', 'Value']);
		parametersSheet.appendRow(['baId', normalizedBaId]);
		parametersSheet.appendRow(['baName', resolvedBaName]);
		
		// Format Parameters sheet header
		const headerRange = parametersSheet.getRange(1, 1, 1, 2);
		headerRange.setFontWeight('bold');
		
		// Apply soft protections to all sheets
		const allSheets = ss.getSheets();
		allSheets.forEach(sheet =>
		{
			const protection = sheet.protect().setDescription('Prevent accidental modifications');
			protection.setWarningOnly(true);
		});
		
		return {
			baId: normalizedBaId,
			baName: resolvedBaName,
			spreadsheetId: spreadsheetId
		};
	}

	static findRepositoryByBaId (baId)
	{
		const normalizedBaId = baId.toLowerCase();
		
		try
		{
			const query = 'properties has { key=\'BA_REPOSITORY_ID\' and value=\'' + normalizedBaId + '\' and visibility=\'PUBLIC\' } and trashed = false';
			const result = Drive.Files.list({ q: query });
			
			if (result && result.items && result.items.length > 0)
			{
				const fileItem = result.items[0];
				return {
					baId: normalizedBaId,
					baName: normalizedBaId.toUpperCase(),
					spreadsheetId: fileItem.id
				};
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
					if (file.getName().toLowerCase().includes(normalizedBaId) || file.getDescription().includes(normalizedBaId))
					{
						return {
							baId: normalizedBaId,
							baName: normalizedBaId.toUpperCase(),
							spreadsheetId: file.getId()
						};
					}
				}
			}
			catch (err)
			{
				// Ignore search fallback failure
			}
		}
		
		return null;
	}

	static getOrCreateRepositoryForBa (baId, baName)
	{
		let repo = Maestro.RepositoryManager.findRepositoryByBaId(baId);
		
		if (!repo)
		{
			repo = Maestro.RepositoryManager.createRepository(baId, baName);
		}
		
		return repo;
	}
};
