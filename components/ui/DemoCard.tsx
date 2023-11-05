'use client'
import { ExpandMoreOutlined } from "@mui/icons-material";
import { Card, CardContent, CardHeader, Collapse, IconButton, IconButtonProps, Typography, styled } from "@mui/material";
import { useState } from "react";


interface Demo {
    title: string;
    entryUrl: string;
    description: string;
    tags: string[];
}

interface DemoCardProps {
    demo: Demo;
}

interface ExpandMoreProps extends IconButtonProps {
    expand: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
    const { expand, ...other } = props;
    return <IconButton {...other} />;
})(({ theme, expand }) => ({
    transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest,
    }),
}));

const DemoCard = ({ demo }: DemoCardProps) => {
    const [expanded, setExpanded] = useState(false);
    const { title, description, entryUrl, tags } = demo;

    const handleExpandClick = () => {
        setExpanded(prev => !prev);
    };
    return (
        <Card>
            <CardHeader title={title}>
            </CardHeader>
            <CardContent>
                <Typography variant="body2">
                    {description}
                </Typography>
            </CardContent>
            <ExpandMore expand={expanded} onClick={handleExpandClick} aria-expanded={expanded} aria-label="show more">
                <ExpandMoreOutlined />
            </ExpandMore>
            <Collapse in={expanded}>
                <CardContent>
                    {expanded ?
                        <iframe src={entryUrl} loading="lazy"
                            style={{ width: '100%', height: '100%', border: 'none', overflow: 'hidden', minHeight: '500px' }} /> : <></>}
                </CardContent>
            </Collapse>

        </Card>)
};
export type { Demo };
export default DemoCard;