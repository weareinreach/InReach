import { Autocomplete, Text, createStyles, Group, InputVariant, SelectItemProps, MantineColor, Avatar } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { Icon } from '../../icon'
import { forwardRef, useState } from 'react';

const useStyles = createStyles((theme) => ({
    autocompleteContainer: {
        width: "100%",
        paddingLeft: theme.spacing.md,
        paddingRight: theme.spacing.md,
        "&:focus": {
            borderColor: theme.other.colors.secondary.black,
            backgroundColor:theme.other.colors.secondary.white
        },
        minWidth:"600px"
    },
    rightIcon: {
        minWidth: '150px',
    },
    leftIcon: {
        color: theme.other.colors.secondary.softBlack
    },
    itemComponent: {
        border: "1px",
        borderColor: theme.other.colors.tertiary.coolGray,
        height: "44px",
        paddingRight: "24px",
        paddingLeft: "24px",
        paddingTop: "12px",
        paddingBottom: "12px",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        "&:hover": {
            backgroundColor: theme.other.colors.tertiary.coolGray
        }

    }

}))




export const SearchBox = ({ type }: Props) => {
    const { classes } = useStyles()
    const { t } = useTranslation()
    const [value, setValue] = useState('');

    const rightIcon = (
        <Group spacing={4} className={classes.rightIcon} onClick={() => { setValue('') }}>
            <Text>Clear</Text>
            <Icon icon="carbon:close" />
        </Group>
    )

    function selectType(type: string) {
        switch (type) {
            case 'location':
                return {
                    placeholder: t('search-box-location-placeholder'),
                    rightIcon: rightIcon,
                    leftIcon: <Icon icon="carbon:map" className={classes.leftIcon} />,
                    variant: "filled" as InputVariant
                }
            case 'organization':
                return {
                    placeholder: t('search-box-organization-placeholder'),
                    rightIcon: rightIcon,
                    leftIcon: <Icon icon="carbon:search" className={classes.leftIcon} />,
                    variant: "default" as InputVariant
                }
        }
    }

    const selectedType = selectType(type)

    const testData = [
        {
            value: 'Bender Bending Rodríguez',
        },

        {
            value: 'Carol Miller',
        },
        {
            value: 'Homer Simpson',
        },
        {
            value: 'Spongebob Squarepants',
        },
    ];

    const data = testData.map((item) => ({ ...item, value: item.value }));

    interface ItemProps extends SelectItemProps {
        value: string;
    }

    const AutoCompleteItem = forwardRef<HTMLDivElement, ItemProps>(
        ({ value, ...others }: ItemProps, ref) => (
            <div ref={ref} {...others}>
                <Text>{value}</Text>
            </div>
        )
    );

    return (
        <Autocomplete
            classNames={{ input: classes.autocompleteContainer }}
            itemComponent={AutoCompleteItem}
            variant={selectedType?.variant}
            label=''
            placeholder={selectedType?.placeholder}
            value={value}
            onChange={setValue}
            data={data}
            icon={selectedType?.leftIcon}
            dropdownPosition="bottom"
            radius="xl"
            rightSection={value.length > 0 ? selectedType?.rightIcon : null}
        />
    )
}

type Props = {
    type: 'location' | 'organization'
}