

import React from 'react';
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { useAppDispatch, useAppSelector } from './app/hooks';
import { initialAuthState, initialAuthStateUpdate, selectAuthState, updateAuthState } from "./reducers/auth/auth";
import TrackedOutlet from './components/OutletTracking';
import PublicConfigs from "./pages/PublicConfigs";
import Unsubscribe from "./pages/unsubscribe";
import config from './config';
const CurateAdminPage = React.lazy(() => import("./pages/curateAdmin"));
const Home = React.lazy(() => import("./pages/home"));
const Challenge = React.lazy(() => import("./pages/Challenge"));
const User = React.lazy(() => import("./pages/user"));
const ReferralWelcome = React.lazy(() => import("./pages/referralWelcome"));
const Login = React.lazy(() => import("./pages/login"));
const Active = React.lazy(() => import("./pages/Active"));
const Following = React.lazy(() => import("./pages/following"));
const CreateNewAccount = React.lazy(() => import("./pages/CreateNewAccount"));
const ForgotPassword = React.lazy(() => import("./pages/ForgotPassword"));
const Search = React.lazy(() => import("./pages/search"));
const CreateProject = React.lazy(() => import("./pages/CreateProject"));
const AccountSettings = React.lazy(() => import("./pages/accountSettings"));
const StripeSuccess = React.lazy(() => import("./pages/stripe/stripeSuccess"));
const StripeSuccessMembership = React.lazy(() => import("./pages/stripe/stripeSuccessMembership"));
const WorkspacePage = React.lazy(() => import("./pages/Workspace"));
const WorkspaceAdvancedPage = React.lazy(() => import("./pages/WorkspaceAdvanced"));
const AttemptPage = React.lazy(() => import("./pages/Attempt"));
const Profile = React.lazy(() => import("./pages/profile"));
const Streak = React.lazy(() => import("./pages/streak"));
const Nemesis = React.lazy(() => import("./pages/nemesis"));
const StripeReauth = React.lazy(() => import("./pages/stripe/stripeReauth"));
const About = React.lazy(() => import("./pages/aboutPage"));
const PremiumDescription = React.lazy(() => import("./pages/premiumSubscriptionDescription"));
const ExclusiveContent = React.lazy(() => import("./pages/exclusiveContent"));
const BuyingExclusiveContent = React.lazy(() => import("./pages/buyingExclusiveContent"));
const Documentation = React.lazy(() => import("./pages/documentation"));
const ResetForgotPassword = React.lazy(() => import("./pages/resetForgotPassword"));
const Journey = React.lazy(() => import("./pages/Journey"));
const JourneyForm = React.lazy(() => import("./pages/JourneyForm"));
const NotFoundPage = React.lazy(() => import("./pages/NotFoundPage"));
const StripeCancel = React.lazy(() => import("./pages/stripe/StripeCancel"));
const AllBytesScroll = React.lazy(() => import("./pages/allBytesScroll"));
const AboutBytes = React.lazy(() => import("./pages/aboutPageBytes"));
const Byte = React.lazy(() => import("./pages/bytes"));
const PrivacyPolicy = React.lazy(() => import("./pages/PrivacyPolicy"))

export default function Routing() {
    // initialize redux dispatcher
    const dispatch = useAppDispatch();

    // load auth state from storage
    const authState = useAppSelector(selectAuthState);

    const userAgent = navigator.userAgent;

    // check if the user agent belongs to a known crawler
    const isCrawler = /Googlebot|Bingbot|Slurp|DuckDuckBot|Baiduspider|YandexBot|Sogou|Google\sInspection\sTool/i.test(userAgent);

    // check if the referrer is from our site
    const isReferrerFromOurSite = new RegExp(config.appDomain.replace(".", "\.")).test(document.referrer);

    /**
     * Protects private routes from unauthenticated and unauthorized access
     * @param role role required for a user to access the page (optional)
     */
    const PrivateRoute = ({ role = null, softBlock = false }) => {
        // if it's a crawler, allow access
        if (isCrawler && softBlock) {
            return <Outlet />;
        }

        // permit direct visitors that are directly accessing the page on softBlock
        if (softBlock && !isReferrerFromOurSite) {
            return <Outlet />;
        }

        // route to login for an unauthenticated user
        if (!authState.authenticated) {
            return <Navigate to="/login" replace={true} />
        }

        // clear expired authentication and route to login
        if (authState.expiration * 1000 < new Date().getTime()) {
            dispatch(updateAuthState(initialAuthState))
            return <Navigate to="/login" replace={true} />
        }

        // route to route for out-of-role url
        if (role !== null && role !== authState.role) {
            return <Navigate to="/login" replace={true} />
        }

        return <Outlet />
    };

    const TokenRouter = () => {
        // clear expired authentication from the session
        if (authState.authenticated && authState.expiration * 1000 < new Date().getTime()) {
            dispatch(updateAuthState(initialAuthState))
        }

        return <Outlet />
    };

    //todo: make sure to add the id aspect to referral id
    return (
        <Routes>
            <Route element={<TrackedOutlet />}>
                <Route element={<TokenRouter />}>
                    <Route path={"/login"} element={<Login />} />
                    <Route path={"/forgotPassword"} element={<ForgotPassword />} />
                    <Route path={"/unsubscribe"} element={<Unsubscribe />} />
                    <Route path={"/resetPassword"} element={<ResetForgotPassword />} />
                    <Route path={"/resetPassword/:token/:id"} element={<ResetForgotPassword />} />
                    <Route path={"/home"} element={<Home />} />
                    <Route path={"/bytes"} element={<AllBytesScroll />} />
                    <Route path="/search" element={<Search />} />
                    <Route path={"/"} element={<Home />} />
                    <Route path={"/signup"} element={<CreateNewAccount />} />
                    <Route path={"/signup/:name"} element={<CreateNewAccount />} />
                    <Route path={"/referral/:name"} element={<ReferralWelcome />} />
                    <Route path={"/about"} element={<About />} />
                    <Route path={"/documentation"} element={<Documentation />} />
                    <Route path={"/documentation/:file"} element={<Documentation />} />
                    <Route path={"/documentation/:level1/:file"} element={<Documentation />} />
                    <Route path={"/documentation/:level1/:level2/:file"} element={<Documentation />} />
                    <Route path={"/premium"} element={<PremiumDescription />} />
                    <Route path={"/buyingExclusive"} element={<BuyingExclusiveContent />} />
                    <Route path={"/aboutExclusive"} element={<ExclusiveContent />} />
                    <Route path="/byte/:id" element={<Byte />} />
                    <Route path={"/aboutBytes"} element={<AboutBytes />} />
                    <Route path={"/privacyPolicy"} element={<PrivacyPolicy/>} />
                    <Route element={<PrivateRoute />}>
                        {/*<Route path={"/journey"} element={<Journey />}/>*/}
                        {/*<Route path={"/journey/form"} element={<JourneyForm />}/>*/}
                        {/*<Route path={"/journey/quiz"} element={<JourneyQuiz />}/>*/}
                        <Route path="/following" element={<Following />} />
                        <Route path="/settings" element={<AccountSettings />} />
                        <Route path="/create-challenge" element={<CreateProject />} />
                        <Route path="/active" element={<Active />} />
                        <Route path={"/profile"} element={<Profile />} />
                        <Route path={"/success"} element={<StripeSuccess />} />
                        <Route path={"/successMembership"} element={<StripeSuccessMembership />} />
                        <Route path={"/cancel"} element={<StripeCancel />} />
                        <Route path={"/canceled"} element={<StripeCancel />} />
                        <Route path={"/reauth"} element={<StripeReauth />} />
                        <Route path="/streak" element={<Streak />} />
                        {/*<Route path="/nemesis" element={<Nemesis />}/>*/}
                        <Route path={"/curateAdmin"} element={<CurateAdminPage />} />
                        <Route path={"/configs"} element={<PublicConfigs />} />
                        <Route path={"/launchpad/:id"} element={<WorkspacePage />} />
                        <Route path={"/workspace/:id"} element={<WorkspaceAdvancedPage />} />
                    </Route >
                    <Route element={<PrivateRoute softBlock={true} />}>
                        <Route path="/challenge/:id" element={<Challenge />} />
                        <Route path="/attempt/:id" element={<AttemptPage />} />
                        <Route path="/user/:id" element={<User />} />
                    </Route>
                    <Route path="*" element={<NotFoundPage />} />
                </Route>
            </Route>
        </Routes >
    )
}
