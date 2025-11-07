//internal modules
const Path = require('path');
console.log(__dirname);
console.log(Path.join(__dirname, 'test.txt'));
//^5.3.0 means package should be at least 5.3.0 and less than 6.0.0 (compatible with minor/patch updates)
//>5.3.0 means package should be greater than 5.3.0
//>=5.3.0 means package should be greater than or equal to 5.3.0
//<5.3.0 means package should be less than 5.3.0
//<=5.3.0 means package should be less than or equal to 5.3.0
//~5.3.0 means package should be greater than or equal to 5.3.0 and less than 5.4.0 (compatible with patch updates)

//use of package-lock.json
//it is used to lock the version of the packages


//--------------------------------
//npm install commander
//create a short and simple cli tool that takes a file path as an argument and prints the number of words in the file

const { Command } = require('commander');
const fs = require('fs');
const program = new Command();

program
    .name('word-counter')
    .description('CLI tool to count words in a file')
    .version('1.0.0');

program
    .argument('<filepath>', 'path to the file')
    .action((filepath) => {
        try {
            const content = fs.readFileSync(filepath, 'utf-8');
            const words = content.trim().split(/\s+/).filter(word => word.length > 0);
            console.log(`Number of words: ${words.length}`);
        } catch (error) {
            console.error(`Error reading file: ${error.message}`);
            process.exit(1);
        }
    });

program.parse(process.argv);