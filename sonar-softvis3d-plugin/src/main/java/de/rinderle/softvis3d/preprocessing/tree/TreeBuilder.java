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

import com.google.inject.Inject;
import de.rinderle.softvis3d.dao.DaoService;
import de.rinderle.softvis3d.domain.VisualizationRequest;
import de.rinderle.softvis3d.domain.sonar.SonarMeasure;
import de.rinderle.softvis3d.domain.tree.RootTreeNode;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.sonar.api.server.ws.LocalConnector;

public class TreeBuilder {

  private static final Logger LOGGER = LoggerFactory.getLogger(TreeBuilder.class);

  @Inject
  private DaoService daoService;

  public RootTreeNode createTreeStructure(LocalConnector localConnector, final VisualizationRequest requestDTO) {
    LOGGER.info("Create tree structure for id {}", requestDTO.getRootSnapshotKey());
    final PathWalker pathWalker = new PathWalker(requestDTO.getRootSnapshotKey());

    addModuleToTreeWalker(pathWalker, requestDTO, localConnector);

    return pathWalker.getTree();
  }

  private void addModuleToTreeWalker(final PathWalker pathWalker, final VisualizationRequest requestDTO,
    LocalConnector localConnector) {
    final List<SonarMeasure> flatChildren = this.daoService.getFlatChildrenWithMetrics(localConnector, requestDTO);

    String moduleName;
    for (final SonarMeasure flatChild : flatChildren) {

      final int lastIndexOf = getLastIndexOfColon(flatChild.getKey());
      moduleName = flatChild.getKey().substring(0, lastIndexOf);

      if (getLastIndexOfColon(moduleName) > 0) {
        moduleName = moduleName.substring(getLastIndexOfColon(moduleName) + 1);
      }

      flatChild.setPath(moduleName + '/' + flatChild.getPath());
      pathWalker.addPath(flatChild);
    }
  }

  private int getLastIndexOfColon(String input) {
    return input.lastIndexOf(':');
  }

}
