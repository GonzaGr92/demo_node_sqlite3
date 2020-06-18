module.exports = (sequelize, DataTypes) => {
    var Artist = sequelize.define('User', {
        ArtistId: DataTypes.INTEGER,
        Name: DataTypes.STRING
    });

    return Artist;
}