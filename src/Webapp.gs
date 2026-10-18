/**
 * Webapp module
 * Handles web app routing, user properties management, and repository automation.
 */
Maestro.Webapp = {
	doGet (e)
	{
		return HtmlService.createHtmlOutputFromFile('Index')
			.setTitle('Maestro - Configuration')
			.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
	},

	getUserRepositories ()
	{
		const props = PropertiesService.getUserProperties();
		const rawData = props.getProperty('BA_REPOSITORIES');
		
		if (rawData)
		{
			return JSON.parse(rawData);
		}
		
		return [];
	},

	saveUserRepositories (repos)
	{
		const props = PropertiesService.getUserProperties();
		props.setProperty('BA_REPOSITORIES', JSON.stringify(repos));
		return { success: true };
	},

	getCurrentUserEmail ()
	{
		return Session.getActiveUser().getEmail() || 'Unknown user';
	},

	getOrCreateAutoRepository ()
	{
		const email = Session.getActiveUser().getEmail() || '';
		const match = email.match (/^(ba[0-9]+)\./i);
		
		if (!match)
		{
			throw new Error('User email not recognized for automatic repository generation (expected format: baXX.*)');
		}
		
		const baId = match[1].toLowerCase();
		const baName = baId.toUpperCase();
		
		const repos = Maestro.Webapp.getUserRepositories();
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
				Maestro.Webapp.saveUserRepositories(repos);
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
						Maestro.Webapp.saveUserRepositories(repos);
						return repo;
					}
				}
			}
			catch (err)
			{
				// Ignore search fallback failure and proceed to creation
			}
		}
		
		repo = Maestro.RepositoryManager.getOrCreateRepositoryForBa(baId, baName);
		if (!repos.some(r => r.baId === baId))
		{
			repos.push(repo);
			Maestro.Webapp.saveUserRepositories(repos);
		}
		
		return repo;
	}
};
