package de.rinderle.softviz3d.handler;

import de.rinderle.softviz3d.layout.calc.Edge;
import de.rinderle.softviz3d.tree.TreeNode;
import org.sonar.api.utils.text.JsonWriter;

import java.util.Map;

/**
 * Created by stefan on 03.11.14.
 */
public class TreeNodeJsonWriterImpl implements TreeNodeJsonWriter {

  @Override
  public void transformTreeToJson(final JsonWriter jsonWriter, final TreeNode tree) {
    jsonWriter.beginObject();

    jsonWriter.prop("id", tree.getId());
    jsonWriter.prop("name", tree.getName());
    jsonWriter.prop("heightMetricValue", tree.getHeightMetricValue());
    jsonWriter.prop("footprintMetricValue", tree.getFootprintMetricValue());
    jsonWriter.prop("isNode", tree.isNode());

    final TreeNode parent = tree.getParent();
    if (parent != null) {
      jsonWriter.name("parentInfo");
      jsonWriter.beginObject();
      jsonWriter.prop("id", parent.getId());
      jsonWriter.prop("name", parent.getName());
      jsonWriter.prop("heightMetricValue", parent.getHeightMetricValue());
      jsonWriter.prop("footprintMetricValue", parent.getFootprintMetricValue());
      jsonWriter.prop("isNode", parent.isNode());
      jsonWriter.endObject();
    }

    this.transformChildren(jsonWriter, tree.getChildren());

    this.transformEdges(jsonWriter, tree.getEdges());

    jsonWriter.endObject();
  }

  private void transformEdges(final JsonWriter jsonWriter, final Map<String, Edge> edges) {
    jsonWriter.name("edges");
    jsonWriter.beginArray();

    for (final Edge child : edges.values()) {
      this.transformEdge(jsonWriter, child);
    }

    jsonWriter.endArray();
  }

  private void transformEdge(final JsonWriter jsonWriter, final Edge edge) {
    jsonWriter.beginObject();
    jsonWriter.prop("id", edge.getSourceId() + " -> " + edge.getDestinationId());
    jsonWriter.endObject();
  }

  private void transformChildren(final JsonWriter jsonWriter, final Map<String, TreeNode> children) {
    jsonWriter.name("children");
    jsonWriter.beginArray();

    for (final TreeNode child : children.values()) {
      this.transformTreeToJson(jsonWriter, child);
    }

    jsonWriter.endArray();
  }
}
