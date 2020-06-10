import React, { useState, useEffect } from "react";
import axios from "axios";
import { SelectionContainer, SelectionOption } from "./styles";
import { Row, Col, Card } from "react-bootstrap";
import { useRouter } from "next/router";
import ReactStars from "react-stars";

import Filter from "./Filter";

const App = ({ app, router }) => {
    return (
        <Col xs={6} md={4} style={{ paddingLeft: "5px", paddingRight: "5px", marginBottom: "5px" }}>
            <Card style={{ width: "100%" }} key={app._id} onClick={() => router.push(`/../apps/${app._id}`)}>
                <Card.Body style={{ padding: "0.5rem 1.25rem" }}>
                    <Card.Title style={{ marginBottom: "5px" }}>
                        <b>{app.name}</b>
                    </Card.Title>{" "}
                    <ReactStars count={5} size={24} value={4} color2={"#ffd700"} edit={false} />
                    <SelectionContainer>
                        {app.useCase.map((_) => {
                            if (_ === "Unterrichtsdurchführung") {
                                return <SelectionOption key={_}>Im Unterricht</SelectionOption>;
                            } else if (_ === "Unterrichtsvorbereitung") {
                                return <SelectionOption key={_}>Vorbereitung</SelectionOption>;
                            }
                            return <SelectionOption key={_}>{_}</SelectionOption>;
                        })}
                    </SelectionContainer>
                </Card.Body>
            </Card>
        </Col>
    );
};

const filterMatching = ({ apps, applicableFilter, field }) => {
    if (applicableFilter.length > 0) {
        console.log(apps,applicableFilter,field)
        const res = [...apps.filter((app) => app[field].filter((_) => applicableFilter.includes(_)).length > 0)];
        return res;
    } else {
        return apps
    }
};

const Overview = () => {
    const router = useRouter();
    const [apps, setApps] = useState(null);
    const [filteredApps, setFilteredApps] = useState(apps);
    const [filterSettings, setFilterSettings] = useState({
        name: "",
        subjects: [],
        schoolTypes: [],
        classes: [],
        useCase: [],
    });

    useEffect(() => {
        axios
            .get(`/api/apps/all`, { withCredentials: true })
            .then((res) => {
                setApps(res.data.data);
            })
            .catch((err) => {
                console.log(err);
            });
    }, []);

    useEffect(() => {
        if (apps) {
            const { name, subjects, schoolTypes, classes, useCase } = filterSettings;
            let filteredApps = [...apps];
            if (name) {
                filteredApps = [...filteredApps.filter((app) => app.name.includes(name))];
            }
            
            filteredApps = filterMatching({ apps: filteredApps, applicableFilter: subjects, field: "subjects" });
            filteredApps = filterMatching({ apps: filteredApps, applicableFilter: schoolTypes, field: "schoolTypes" });
            filteredApps = filterMatching({ apps: filteredApps, applicableFilter: classes, field: "classes" });
            filteredApps = filterMatching({ apps: filteredApps, applicableFilter: useCase, field: "useCase" });

            setFilteredApps(filteredApps);
        }
    }, [apps, filterSettings]);

    return (
        <>
            <Filter {...{ filterSettings, setFilterSettings }} />
            {filteredApps ? (
                <Row style={{ marginLeft: "-5px", marginRight: "-5px" }}>
                    {filteredApps.map((_) => (
                        <App app={_} router={router} key={_._id} />
                    ))}
                </Row>
            ) : (
                <Card>stuff</Card>
            )}
        </>
    );
};

export default Overview;
