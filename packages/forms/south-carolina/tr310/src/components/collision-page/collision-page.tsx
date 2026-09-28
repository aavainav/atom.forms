import React from "react";
import { IControllerManager, IPageBinding } from "@forms/core";

import { CollisionPageModel } from "../../models/collision-page/collision-page";

import { HeaderSection } from "./header-section";
import { CollisionSection } from "./collision-section";
import { RouteSection } from "./route-section";
import { BaseIntersectionSection } from "./base-intersection-section";
import { SecondIntersectionSection } from "./second-intersection-section";
import { CoordinatesSection } from "./coordinates-section";
import { TrafficwaySection } from "./trafficway-section";
import { BarrierSection } from "./barrier-section";
import { ConditionsSection } from "./conditions-section";
import { HarmfulEventSection } from "./harmful-event-section";
import { JunctionSection } from "./junction-section";
import { WorkZoneSection } from "./work-zone-section";
import { WitnessSection } from "./witness-section";
import { CollisionOfficerSection } from "./collision-officer-section";

interface ICollisionPageProps {
    /** The controllers belonging to the form this page is part of. */
    readonly controllers: IControllerManager;
    /** Binds this page instance to the form controller. */
    readonly binding: IPageBinding<CollisionPageModel>;
}

/** Defines the collision page of the TR-310, the one page describing the collision itself. */
export default function CollisionPage({ controllers, binding }: ICollisionPageProps): React.JSX.Element {
    const page = binding.get();

    return (
        <>
            <HeaderSection binding={binding.getSection(page.headerSection)} />
            <CollisionSection binding={binding.getSection(page.collisionSection)} />
            <RouteSection binding={binding.getSection(page.routeSection)} />
            <BaseIntersectionSection binding={binding.getSection(page.baseIntersectionSection)} />
            <SecondIntersectionSection binding={binding.getSection(page.secondIntersectionSection)} />
            <CoordinatesSection binding={binding.getSection(page.coordinatesSection)} />
            <TrafficwaySection binding={binding.getSection(page.trafficwaySection)} />
            <BarrierSection binding={binding.getSection(page.barrierSection)} />
            <ConditionsSection binding={binding.getSection(page.conditionsSection)} />
            <HarmfulEventSection binding={binding.getSection(page.harmfulEventSection)} />
            <JunctionSection binding={binding.getSection(page.junctionSection)} />
            <WorkZoneSection binding={binding.getSection(page.workZoneSection)} />
            <WitnessSection binding={binding.getSectionCollection(page.witnessSection)} />
            <CollisionOfficerSection binding={binding.getSection(page.collisionOfficerSection)} />
        </>
    );
}
