
exports.fillTemplate = async ( template, values ) => {
    return template.replace(/\$\{(.*?)\}/g, (_, key) => values[key] || '');
};