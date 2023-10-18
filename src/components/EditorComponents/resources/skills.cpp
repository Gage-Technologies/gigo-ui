#include <string>
#include <vector>
#include <iostream>
using namespace std;

int main()
{
    string s = "My skills include: ";
    vector<string> l = {
        "Python",
        "C++",
        "Java",
        "Javascript",
        "React",
        "React Native",
        "Node",
        "Docker",
        "AWS",
        "Spring",
        "Among others..."};
    cout << s << endl;
    int size = sizeof(l) / sizeof(l[0]);
    for (int i = 0; i < size; i++)
    {
        cout << l[i] << endl;
    }
    return 0;
}