import { AppBar, Box, Typography } from "@mui/material";
import { readFileSync } from "fs";
import DemoCard, { Demo } from "../components/ui/DemoCard";


async function getData(): Promise<Demo[]> {
  return JSON.parse(readFileSync('./public/prj_index.json','utf8')) as Demo[];
}

export default async function Home() {
  const data = await getData();
  return (
    <Box sx={{alignItems:'center', display:'flex', flexDirection:'column'}}>
      <AppBar position="static">
        <Typography variant="h3">
          LUCYDREAM
        </Typography>
      </AppBar>
      <Box sx={{display:'flex', flexDirection:'column', alignItems:'center', maxWidth:'600px'}}>
        {data.map((demo,id) => <Box key={id} sx={{p:1}}><DemoCard demo={demo}></DemoCard></Box>)}
      </Box>
    </Box>
  )
}
