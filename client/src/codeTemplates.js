const codeTemplates = {};

codeTemplates.c = `
#include <stdio.h>
int main() {
    printf("Hello world!");
    return 0;
}
`;

codeTemplates.cpp = `
#include <iostream>

using namespace std;

int main() {
    cout<<"Hello world!"<<flush;
    return 0;
}
`;

codeTemplates.py = `
print("Hello world!")
`;

codeTemplates.js = `
console.log('Hello world!');
`;

codeTemplates.php = `
<?php echo 'Hello world!'; ?>
`;

export default codeTemplates;
