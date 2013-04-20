package ru.amalyuhin.managers;

import com.hp.hpl.jena.rdf.model.*;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created with IntelliJ IDEA.
 * User: amalyuhin
 * Date: 10.04.13
 * Time: 1:02
 * To change this template use File | Settings | File Templates.
 */
public class OntologyManager {

    private static List<String> _nodes = null;

    /**
     * Load ontology from file
     *
     * @param file InputStream for ontology file
     * @return
     */
    public static Model loadOntology(InputStream file) {
        Model model = ModelFactory.createDefaultModel();
        model.read(file, "RDF/XML");

        return model;
    }

    /**
     * Get list of nodes
     *
     * @param model
     * @return
     */
    public static List<String> getNodes(Model model) {
        if (null == _nodes) {
            _nodes = new ArrayList<String>();

            for (ResIterator i = model.listSubjects(); i.hasNext(); ) {
                Resource r = i.next();
                _nodes.add(getLabel(r));
            }
        }

        return _nodes;
    }

    /**
     * Get list of links
     *
     * @param model
     * @return
     */
    public static List<Map<String, String>> getLinks(Model model) {
        List<Map<String, String>> links = new ArrayList<Map<String, String>>();

        for (StmtIterator i = model.listStatements(null, null, (RDFNode) null); i.hasNext(); ) {
            Statement stmt = i.nextStatement();
            Map<String, String> map = new HashMap<String, String>();

            Integer fromIndex = _nodes.indexOf(getLabel(stmt.getSubject()));
            Integer toIndex = _nodes.indexOf(getLabel(stmt.getObject()));

            if (fromIndex != -1 && toIndex != -1) {
                map.put("from", String.valueOf(fromIndex));
                map.put("to", String.valueOf(toIndex));
                map.put("type", getLabel(stmt.getPredicate()));

                links.add(map);
            }
        }

        return links;
    }

    /**
     * Get label for subject
     *
     * @param obj
     * @return
     */
    public static String getLabel(Resource obj) {
        return (null != obj.getLocalName()) ? obj.getLocalName() : obj.toString();
    }

    /**
     * Get label for object
     *
     * @param obj
     * @return
     */
    public static String getLabel(RDFNode obj) {
        String label;

        if (obj instanceof Resource) {
            label = getLabel((Resource) obj);
        } else {
            label = obj.toString();
        }

        return label;
    }

    /**
     * Get label for property
     *
     * @param obj
     * @return
     */
    public static String getLabel(Property obj) {
        return (null != obj.getLocalName()) ? obj.getLocalName() : obj.toString();
    }
}
