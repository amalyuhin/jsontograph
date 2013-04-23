jsOntoGraph
===========

SPARQL query examples
---------------------

##### h2o.owl:
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX dc: <http://purl.org/dc/elements/1.1/>
    PREFIX ds: <http://www.saga.iao.ru/ontology/V5/DataSource.owl#>

    SELECT ?s ?p ?o
    WHERE {
      ?p rdf:type ds:RMSPair .
      ?p ds:hasRMSMember ?s .
      ?p ds:hasRMSMember ?o
    }



##### Thesaurus.owl:
    PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX owl2: <http://www.w3.org/2006/12/owl2#>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    PREFIX owl2xml: <http://www.w3.org/2006/12/owl2-xml#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX protege: <http://protege.stanford.edu/plugins/owl/protege#>
    PREFIX Thesaurus: <http://ncicb.nci.nih.gov/xml/owl/EVS/Thesaurus.owl#>

    SELECT ?s ?p ?o WHERE {
      ?s ?p ?o .
      ?s a owl:Class .
      ?o a owl:Class
    } LIMIT 1000
