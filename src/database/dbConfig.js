module.exports = {
	url: process.env.MONGODB_URI || "mongodb://enlightiumacademy-mongo:27017",
	database: process.env.DATABASE ||"enlightiumacademyDB"
};
