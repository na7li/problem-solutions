#include <stdio.h>
/*
----------------  LOGIC  --------------------
clean up the input argument
calculate invalide parenthisis
find valide formats and print them
*/

int ft_strlen(char *str)
{
    int len = 0;

    while (str[len])
        len++;
    return (len);
}

void    validate_str(char *str, int end)
{
    while (*str)
    {
        if (*str == '(')
            break;
        if (*str == ')')
            *str = '~';
        str++;
    }
    while (end >= 0)
    {
        if (str[end] == ')')
            break;
        if (str[end] == '(')
            str[end] = '~';
        end--;
    }
}

int calculate_ip(char *str)
{
    int open = 0, close = 0;
    if (!*str)
    return 0;
    while (*str)
    {
        if (*str == '(')
            open++;
        else if (*str == ')') {
            if (open)
            open--;
            else
            close++;
        }
        str++;
    }
    return (open + close);
}

void    find_valid_format(char *str, char *buffer, int rm, int open, int i)
{
    if (!str[i]) {
        if (!rm && !open) {
            buffer[i] = '\0';
            puts(buffer);
        }
        return ;
    }
    if (rm) {
        buffer[i] = '_';
        find_valid_format(str, buffer, rm - 1, open, i + 1);
    }
    if (str[i] == '(') {
        buffer[i] = '(';
        find_valid_format(str, buffer, rm, open + 1, i + 1);
    }
    else if (str[i] == ')') {
        if (open > 0) {
            buffer[i] = ')';
            find_valid_format(str, buffer, rm, open - 1, i + 1);
        }
    }
    else {
        buffer[i] = str[i];
        find_valid_format(str, buffer, rm, open, i + 1);
    }
}

int main(int argc, char **argv)
{
    int length, rm;
    if (argc != 2 || !argv[1] || !*argv[1])
        return (1);

    char *str = argv[1];
    length = ft_strlen(str);
    char buffer[length];
    validate_str(str, length - 1);
    rm = calculate_ip(str);
    if (!rm)
        return (puts(str), 0);
    find_valid_format(str, buffer, rm, 0, 0);
    return (0);
}
