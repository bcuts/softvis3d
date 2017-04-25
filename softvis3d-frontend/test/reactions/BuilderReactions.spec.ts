///
/// softvis3d-frontend
/// Copyright (C) 2016 Stefan Rinderle and Yvo Niedrich
/// stefan@rinderle.info / yvo.niedrich@gmail.com
///
/// This program is free software; you can redistribute it and/or
/// modify it under the terms of the GNU Lesser General Public
/// License as published by the Free Software Foundation; either
/// version 3 of the License, or (at your option) any later version.
///
/// This program is distributed in the hope that it will be useful,
/// but WITHOUT ANY WARRANTY; without even the implied warranty of
/// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
/// Lesser General Public License for more details.
///
/// You should have received a copy of the GNU Lesser General Public
/// License along with this program; if not, write to the Free Software
/// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02
///
import {expect} from "chai";
import {SceneStore} from "../../src/stores/SceneStore";
import {CityBuilderStore} from "../../src/stores/CityBuilderStore";
import BuilderReactions from "../../src/reactions/BuilderReactions";
import {evostreet} from "../../src/constants/Layouts";
import {leakPeriod} from "../../src/constants/Profiles";
import {complexityMetricId, coverageColorMetric, newLinesOfCodeMetricId} from "../../src/constants/Metrics";
import {EXPONENTIAL} from "../../src/constants/Scales";
import Metric from "../../src/classes/Metric";
import SonarQubeLegacyService from "../../src/services/sonarqube/SonarQubeLegacyService";
import {AppStatusStore} from "../../src/stores/AppStatusStore";
import * as Sinon from "sinon";

describe("BuilderReactions", () => {

    it("should initiate build process - part 1 invalidate existing scene", () => {
        let testCityBuilderStore = new CityBuilderStore();
        const testSonarService = Sinon.createStubInstance(SonarQubeLegacyService) as any;
        const reactionRegister = new BuilderReactions(testCityBuilderStore, testSonarService as SonarQubeLegacyService);

        expect(testSonarService.loadLegacyBackend.notCalled).to.be.true;

        testCityBuilderStore.initiateBuildProcess = true;

        expect(reactionRegister).not.to.be.null;
        expect(testCityBuilderStore.initiateBuildProcess).to.be.false;
        expect(testSonarService.loadLegacyBackend.calledOnce).to.be.true;
    });

    it("should initiate build process - part 2 transfer option values", () => {
        let testCityBuilderStore = new CityBuilderStore();
        let testSceneStore = new SceneStore();
        let testAppStatusStore: AppStatusStore = new AppStatusStore();
        let testSonarService: SonarQubeLegacyService =
            new SonarQubeLegacyService("", "", testAppStatusStore, testCityBuilderStore, testSceneStore);

        let expectedLayout = evostreet;
        let expectedProfile = leakPeriod;
        let expectedScale = EXPONENTIAL;
        let expectedColorMetric = coverageColorMetric;

        testCityBuilderStore.genericMetrics.addMetric(new Metric(complexityMetricId, "", ""));
        testCityBuilderStore.genericMetrics.addMetric(new Metric(newLinesOfCodeMetricId, "", ""));

        testCityBuilderStore.layout = expectedLayout;
        testCityBuilderStore.profile = expectedProfile;
        testCityBuilderStore.profile.scale = expectedScale;
        testCityBuilderStore.metricColor = expectedColorMetric;

        const reactionRegister = new BuilderReactions(testCityBuilderStore, testSonarService);

        testCityBuilderStore.initiateBuildProcess = true;

        expect(reactionRegister).not.to.be.null;
        expect(testSceneStore.options.layout).to.be.eq(expectedLayout);
        expect(testSceneStore.options.metricColor).to.be.eq(expectedColorMetric);
        expect(testSceneStore.options.footprint.id).to.be.eq(expectedProfile.footprintMetricId);
        expect(testSceneStore.options.height.id).to.be.eq(expectedProfile.heightMetricId);
        expect(testSceneStore.options.scale).to.be.eq(expectedScale);
    });

});