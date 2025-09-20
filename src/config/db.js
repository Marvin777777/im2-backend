import serverlessMysql from "serverless-mysql";

const dbConn = serverlessMysql({
  config: {
    host: "localhost",
    database: "im-2-midterm",
    user: "root",
    password: "",
    port: 3306,
  },
});

export default dbConn;
