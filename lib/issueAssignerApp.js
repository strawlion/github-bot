const probotCommands = require('probot-commands');

module.exports = robot => {
    probotCommands(robot, 'assign', assignTaggedNames);
}

async function assignTaggedNames(context, command) {
    const { payload, github } = context;

    const assigneeNames = command.arguments.split(/  */)
                                 .filter(name => name.startsWith('@'))
                                 .map(name => name.slice(1));

    const newAssignees = await getValidCollaborators(github, payload.repository, assigneeNames);

    if (newAssignees.length) {
        await github.issues.addAssigneesToIssue(context.issue({ assignees: newAssignees }));
    }
}

async function getValidCollaborators(github, repo, collaboratorNames) {

    return Promise.all(collaboratorNames.map(isValidCollaborator))
                  .then(validCollaborators => collaboratorNames.filter((name, index) => validCollaborators[index]));

    function isValidCollaborator(name) {
        return github.repos.checkCollaborator({ owner: repo.owner.login, repo: repo.name, username: name })
                    .then(isCollaboratorResponse => isCollaboratorResponse.meta.status === '204 No Content'); // TODO: Is raw code available?
    }
}