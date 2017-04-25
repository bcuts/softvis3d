/**
 * SoftVis3D Sonar plugin
 * Copyright (C) 2016 Stefan Rinderle and Yvo Niedrich
 * stefan@rinderle.info / yvo.niedrich@gmail.com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02
 */
package de.rinderle.softvis3d.preprocessing.tree;

import de.rinderle.softvis3d.dao.DaoService;
import de.rinderle.softvis3d.domain.VisualizationRequest;
import de.rinderle.softvis3d.domain.sonar.SonarMeasure;
import de.rinderle.softvis3d.domain.tree.RootTreeNode;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.junit.Before;
import org.junit.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.sonar.api.server.ws.LocalConnector;

import static org.junit.Assert.assertEquals;
import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.when;

/**
 * Created by stefanrinderle on 23.04.16.
 */
public class TreeBuilderTest {

  private final String snapshotKey = "123";

  private static final String[] METRICS = {"other", "complediy"};

  @InjectMocks
  private TreeBuilder underTest;

  @Mock
  private DaoService daoService;

  @Mock
  private LocalConnector localConnector;

  @Before
  public void setUp() {
    MockitoAnnotations.initMocks(this);
  }

  @Test
  public void createTreeStructure() throws Exception {
    final VisualizationRequest requestDTO = new VisualizationRequest(this.snapshotKey, METRICS);

    RootTreeNode result = underTest.createTreeStructure(localConnector, requestDTO);

    assertEquals(0, result.getChildren().size());
    assertEquals(this.snapshotKey, result.getId());
  }

  @Test
  public void createTreeStructureWithChildren() throws Exception {
    final VisualizationRequest requestDTO = new VisualizationRequest(this.snapshotKey, METRICS);

    final List<SonarMeasure> measures = new ArrayList<>();
    measures.add(new SonarMeasure("2", "2", "/src/main/2", Collections.emptyMap(),
      "composer:src/Composer/Command/AboutCommand.php"));
    when(this.daoService.getFlatChildrenWithMetrics(eq(localConnector), eq(requestDTO))).thenReturn(measures);

    final RootTreeNode result = underTest.createTreeStructure(localConnector, requestDTO);

    assertEquals(1, result.getChildren().size());
    assertEquals(1, result.getChildren().values().iterator().next().getDepth().intValue());
    assertEquals("composer", result.getChildren().values().iterator().next().getName());
    assertEquals(this.snapshotKey, result.getId());
  }

  @Test
  public void createTreeStructureWithChildrenKey() throws Exception {
    final VisualizationRequest requestDTO = new VisualizationRequest(this.snapshotKey, METRICS);

    final List<SonarMeasure> measures = new ArrayList<>();
    measures.add(new SonarMeasure("2", "2", "/src/main/2", Collections.emptyMap(),
        "org.sonarsource.sonarqube:sonar-db:src/test/java/org/sonar/db/version/DecimalColumnDefTest.java"));
    when(this.daoService.getFlatChildrenWithMetrics(eq(localConnector), eq(requestDTO))).thenReturn(measures);

    final RootTreeNode result = underTest.createTreeStructure(localConnector, requestDTO);

    assertEquals(1, result.getChildren().size());
    assertEquals(1, result.getChildren().values().iterator().next().getDepth().intValue());
    assertEquals("sonar-db", result.getChildren().values().iterator().next().getName());
    assertEquals(this.snapshotKey, result.getId());
  }

}