const chalk = require('chalk');

function Logger(){

    this.error = (message) => {
        const timestamp = new Date();
        console.log(chalk.red(`${timestamp.toLocaleString()}  :  🛑 ${message}`));
    }
    
    this.success = (message) => {
        const timestamp = new Date();
        console.log(chalk.green(`${timestamp.toLocaleString()}  :  ✅ ${message}`));
    }
    
    this.info = (message) => {
        const timestamp = new Date();
        console.log(chalk.cyan(`${timestamp.toLocaleString()}  :  🔷 ${message}`));
    }
    
    this.warning = (message) => {
        const timestamp = new Date();
        console.log(chalk.yellow(`${timestamp.toLocaleString()}  :  🚧 ${message}`));
    }

}


module.exports = Logger;