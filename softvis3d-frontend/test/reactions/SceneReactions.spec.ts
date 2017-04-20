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
import { assert, expect } from "chai";
import * as Sinon from "sinon";
import { SceneStore } from "../../src/stores/SceneStore";
import { CityBuilderStore } from "../../src/stores/CityBuilderStore";
import SceneReactions from "../../src/reactions/SceneReactions";
import { AppStatusStore } from "../../src/stores/AppStatusStore";
import LegacyCityCreator from "../../src/legacy/LegacyCityCreator";
import SonarQubeLegacyService from "../../src/services/sonarqube/SonarQubeLegacyService";
import { complexityColorMetric } from "../../src/constants/Metrics";
import SoftVis3dScene from "../../src/components/scene/visualization/SoftVis3dScene";
import { Vector3 } from "three";
import SonarQubeScmService from "../../src/services/sonarqube/SonarQubeScmService";

describe("SceneReactions", () => {

    it("should change city builder color metric setting if changed in the scene", () => {
        let testCityBuilderStore = new CityBuilderStore();
        let testSceneStore = new SceneStore();
        let testAppStatusStore: AppStatusStore = new AppStatusStore();
        let testSonarScmService: SonarQubeScmService =
            new SonarQubeScmService("", testAppStatusStore, testSceneStore);
        let testLegayCreator: LegacyCityCreator =
            new LegacyCityCreator(testSceneStore, testAppStatusStore, testSonarScmService);
        let testSonarService: SonarQubeLegacyService =
            new SonarQubeLegacyService("", "", testAppStatusStore, testCityBuilderStore, testSceneStore);

        new SceneReactions(testSceneStore, testCityBuilderStore, testAppStatusStore, testLegayCreator,
            testSonarService);

        testSceneStore.options.metricColor = complexityColorMetric;

        expect(testCityBuilderStore.metricColor).to.be.eq(complexityColorMetric);
    });

    it("should load backend legacy data when the scene should be rendered", () => {
        let testCityBuilderStore = new CityBuilderStore();
        let testSceneStore = new SceneStore();
        let testAppStatusStore: AppStatusStore = new AppStatusStore();

        let testSonarScmService: SonarQubeScmService = new SonarQubeScmService("", testAppStatusStore, testSceneStore);
        let testLegayCreator: LegacyCityCreator =
            new LegacyCityCreator(testSceneStore, testAppStatusStore, testSonarScmService);
        let testSonarService: SonarQubeLegacyService =
            new SonarQubeLegacyService("", "", testAppStatusStore, testCityBuilderStore, testSceneStore);

        let mockLoad = Sinon.mock(testSonarService);
        mockLoad.expects("loadLegacyBackend").once();

        new SceneReactions(testSceneStore, testCityBuilderStore, testAppStatusStore, testLegayCreator,
            testSonarService);

        testSceneStore.refreshScene = true;

        mockLoad.verify();
    });

    it("should not load backend legacy when refresh scene goes to false", () => {
        let testCityBuilderStore = new CityBuilderStore();
        let testSceneStore = new SceneStore();
        let testAppStatusStore: AppStatusStore = new AppStatusStore();

        let testSonarScmService: SonarQubeScmService = new SonarQubeScmService("", testAppStatusStore, testSceneStore);
        let testLegayCreator: LegacyCityCreator =
            new LegacyCityCreator(testSceneStore, testAppStatusStore, testSonarScmService);
        let testSonarService: SonarQubeLegacyService =
            new SonarQubeLegacyService("", "", testAppStatusStore, testCityBuilderStore, testSceneStore);

        let mockLoad = Sinon.mock(testSonarService);
        // once called for the switch to true.
        mockLoad.expects("loadLegacyBackend").once();

        new SceneReactions(testSceneStore, testCityBuilderStore, testAppStatusStore, testLegayCreator,
            testSonarService);

        testSceneStore.refreshScene = true;
        testSceneStore.refreshScene = false;

        mockLoad.verify();
    });

    it("should NOT load backend legacy data when the scene should NOT be rendered", () => {
        let testCityBuilderStore = new CityBuilderStore();
        let testSceneStore = new SceneStore();
        let testAppStatusStore: AppStatusStore = new AppStatusStore();

        let testSonarScmService: SonarQubeScmService = new SonarQubeScmService("", testAppStatusStore, testSceneStore);
        let testLegayCreator: LegacyCityCreator =
            new LegacyCityCreator(testSceneStore, testAppStatusStore, testSonarScmService);
        let testSonarService: SonarQubeLegacyService =
            new SonarQubeLegacyService("", "", testAppStatusStore, testCityBuilderStore, testSceneStore);

        let mockLoad = Sinon.mock(testSonarService);
        mockLoad.expects("loadLegacyBackend").never();

        new SceneReactions(testSceneStore, testCityBuilderStore, testAppStatusStore, testLegayCreator,
            testSonarService);

        testSceneStore.refreshScene = false;

        mockLoad.verify();
    });

    it("should rebuild city if color metric changed", () => {
        let testCityBuilderStore = new CityBuilderStore();
        let testSceneStore = new SceneStore();
        let testAppStatusStore: AppStatusStore = new AppStatusStore();

        let testSonarScmService: SonarQubeScmService = new SonarQubeScmService("", testAppStatusStore, testSceneStore);
        let testLegayCreator: LegacyCityCreator =
            new LegacyCityCreator(testSceneStore, testAppStatusStore, testSonarScmService);
        let testSonarService: SonarQubeLegacyService =
            new SonarQubeLegacyService("", "", testAppStatusStore, testCityBuilderStore, testSceneStore);

        let mockBuild = Sinon.mock(testLegayCreator);
        mockBuild.expects("createCity").once();

        new SceneReactions(testSceneStore, testCityBuilderStore, testAppStatusStore, testLegayCreator,
            testSonarService);

        testSceneStore.shapes = [];
        testSceneStore.options.metricColor = complexityColorMetric;

        mockBuild.verify();
    });

    it("should convert backend data to threeJS shapes", () => {
        let testCityBuilderStore = new CityBuilderStore();
        let testSceneStore = new SceneStore();
        let testAppStatusStore: AppStatusStore = new AppStatusStore();

        let testSonarScmService: SonarQubeScmService = new SonarQubeScmService("", testAppStatusStore, testSceneStore);
        let testLegayCreator: LegacyCityCreator =
            new LegacyCityCreator(testSceneStore, testAppStatusStore, testSonarScmService);
        let testSonarService: SonarQubeLegacyService =
            new SonarQubeLegacyService("", "", testAppStatusStore, testCityBuilderStore, testSceneStore);

        let mockBuild = Sinon.mock(testLegayCreator);
        mockBuild.expects("createCity").once();

        new SceneReactions(testSceneStore, testCityBuilderStore, testAppStatusStore, testLegayCreator,
            testSonarService);

        testSceneStore.legacyData = {
            id: "",
            name: "",
            isNode: false,
            children: [],
            measures: {},
            parentId: null
        };

        mockBuild.verify();
    });

    it("should load new objects in scene", () => {
        let testCityBuilderStore = new CityBuilderStore();
        let testSceneStore = new SceneStore();
        testSceneStore.cameraPosition = new Vector3(1, 2, 3);

        let testAppStatusStore: AppStatusStore = new AppStatusStore();
        let spyLoad = Sinon.spy(testAppStatusStore, "load");
        let spyLoadComplete = Sinon.spy(testAppStatusStore, "loadComplete");

        let testSonarScmService: SonarQubeScmService = new SonarQubeScmService("", testAppStatusStore, testSceneStore);
        let testLegayCreator: LegacyCityCreator =
            new LegacyCityCreator(testSceneStore, testAppStatusStore, testSonarScmService);
        let testSonarService: SonarQubeLegacyService =
            new SonarQubeLegacyService("", "", testAppStatusStore, testCityBuilderStore, testSceneStore);

        let scenePainter: SoftVis3dScene = new SoftVis3dScene();
        testSceneStore.scenePainter = scenePainter;
        let mockScenePainter = Sinon.mock(scenePainter);
        mockScenePainter.expects("loadSoftVis3d").calledWith([], testSceneStore.cameraPosition);

        // mock refresh scene reaction
        let mockSonarService = Sinon.mock(testSonarService);
        mockSonarService.expects("loadLegacyBackend").calledOnce;

        new SceneReactions(testSceneStore, testCityBuilderStore, testAppStatusStore, testLegayCreator,
            testSonarService);

        testSceneStore.refreshScene = true;

        // trigger action
        testSceneStore.shapes = [];
        testSceneStore.sceneComponentIsMounted = true;

        mockScenePainter.verify();

        assert(spyLoad.calledWith(SceneReactions.LOAD_SOFTVIS));
        assert(spyLoadComplete.calledWith(SceneReactions.LOAD_SOFTVIS));

        expect(testSceneStore.refreshScene).to.be.eq(false);
    });

    it("should load new objects in scene - color update", () => {
        let testCityBuilderStore = new CityBuilderStore();
        let testSceneStore = new SceneStore();

        let testAppStatusStore: AppStatusStore = new AppStatusStore();

        let testSonarScmService: SonarQubeScmService = new SonarQubeScmService("", testAppStatusStore, testSceneStore);
        let testLegayCreator: LegacyCityCreator =
            new LegacyCityCreator(testSceneStore, testAppStatusStore, testSonarScmService);
        let testSonarService: SonarQubeLegacyService =
            new SonarQubeLegacyService("", "", testAppStatusStore, testCityBuilderStore, testSceneStore);

        let scenePainter: SoftVis3dScene = new SoftVis3dScene();
        testSceneStore.scenePainter = scenePainter;
        let mockScenePainter = Sinon.mock(scenePainter);
        mockScenePainter.expects("updateColorsWithUpdatedShapes").calledOnce;

        new SceneReactions(testSceneStore, testCityBuilderStore, testAppStatusStore, testLegayCreator,
            testSonarService);

        // trigger action
        testSceneStore.shapes = [];
        testSceneStore.sceneComponentIsMounted = true;

        mockScenePainter.verify();
        expect(testSceneStore.refreshScene).to.be.eq(false);
    });

    it("should select object in scene", () => {
        let testCityBuilderStore = new CityBuilderStore();
        let testSceneStore = new SceneStore();

        let testAppStatusStore: AppStatusStore = new AppStatusStore();

        let testSonarScmService: SonarQubeScmService = new SonarQubeScmService("", testAppStatusStore, testSceneStore);
        let testLegayCreator: LegacyCityCreator =
            new LegacyCityCreator(testSceneStore, testAppStatusStore, testSonarScmService);
        let testSonarService: SonarQubeLegacyService =
            new SonarQubeLegacyService("", "", testAppStatusStore, testCityBuilderStore, testSceneStore);

        let scenePainter: SoftVis3dScene = new SoftVis3dScene();
        testSceneStore.scenePainter = scenePainter;
        let mockScenePainter = Sinon.mock(scenePainter);

        let expectedObjectId: string = "isudgfisufg";
        mockScenePainter.expects("selectSceneTreeObject").calledWith(expectedObjectId);

        new SceneReactions(testSceneStore, testCityBuilderStore, testAppStatusStore, testLegayCreator,
            testSonarService);

        // trigger action
        testSceneStore.selectedObjectId = expectedObjectId;

        mockScenePainter.verify();
    });
});