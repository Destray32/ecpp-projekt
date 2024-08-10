
function DostepneGrupy(req, res) {
    res.json([
        // usunalem na razie id zeby latwiej korzystac z mojego stanu setAvailableGroups
        {name: 'wszyscy'},
        {name: 'inni'},
        {name: 'grupa1'},
        {name: 'grupa2'},
        {name: 'grupa3'},
    ]);
}

module.exports = DostepneGrupy;