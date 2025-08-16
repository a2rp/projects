import { Box, CircularProgress } from '@mui/material'
import { lazy, Suspense } from 'react'
import { NavLink, Route, Routes } from 'react-router-dom'
import { Styled } from './App.styled'
import ScrollToTop from './components/ScrollToTop'

// add this near the top
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// replace your lazy imports with these
const Home = lazy(() => sleep(800).then(() => import('./pages/home')))
const About = lazy(() => sleep(800).then(() => import('./pages/about')))
const NotFound = lazy(() => sleep(800).then(() => import('./pages/notFound')))

const App = () => {
    return (
        <>
            <Styled.Wrapper>
                <Styled.Header>
                    <Styled.HeaderMain>
                        <Styled.NavLink to="/">Projects</Styled.NavLink>
                        <Styled.NavLink to="/about">About</Styled.NavLink>
                    </Styled.HeaderMain>
                </Styled.Header>
                <Styled.Main>
                    <ScrollToTop />
                    <Suspense fallback={<Box sx={{
                        height: "100vh",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}>
                        <CircularProgress />
                    </Box>}>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/about" element={<About />} />
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </Suspense>
                </Styled.Main>
                <Styled.Footer>
                    <Styled.FooterMain>
                        <Styled.FooterCol>
                            &copy; {new Date().getFullYear()} | All Rights Reserved.
                        </Styled.FooterCol>
                        <Styled.FooterCol>
                            By <a href="https://www.ashishranjan.net" target="_blank">Ashish Ranjan</a>
                        </Styled.FooterCol>
                    </Styled.FooterMain>
                </Styled.Footer>
            </Styled.Wrapper>
        </>
    )
}

export default App
