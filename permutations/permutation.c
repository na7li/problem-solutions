/*
sort
find permutation: 
swap
revers
puts
*/

#include <stdio.h>

enum {NO_PERMUTATION, NEW_PERMUTATION};

int ft_strlen(char *str)
{
    int i = 0;

    if (!str || !*str)
        return (0);
    while (str[i])
        i++;
    return (i);
}

void    swap_chars(char *a, char *b)
{
    char tmp;

    tmp = *a;
    *a = *b;
    *b = tmp;
}

void    sort_permuta(char *permuta)
{
    int i = 0;

    if (!permuta || !*permuta)
        return ;
    while (permuta[i + 1])
    {
        if (permuta[i] > permuta[i + 1])
        {
            swap_chars(&permuta[i], &permuta[i + 1]);
            i = 0;
        }
        else
            i++;
    }
}

void    revers(char *permuta, int start, int end)
{
    while (start < end)
    {
        swap_chars(&permuta[start], &permuta[end]);
        start++;
        end--;
    }
}

int find_permutation(char *permuta, int end)
{
    int i = end - 1;
    int j = end;

    while (permuta[i] > permuta[i + 1] && i != -1)
        i--;
    if (i < 0)
        return (NO_PERMUTATION);
    while (permuta[j] < permuta[i])
        j--;
    swap_chars(&permuta[i], &permuta[j]);
    revers(permuta, i + 1, end);

}

int main(int ac, char **av)
{
    int     length;
    char    *permuta;

    if (ac != 2 || !av[1] || !*av[1])
    return (1);
    permuta = av[1];
    length = ft_strlen(permuta);
    if (length == 1)
        return (puts(permuta), 0);
    sort_permuta(permuta);
    do {
        puts(permuta);
    } while (find_permutation(permuta, length - 1));
    return (0);
}
