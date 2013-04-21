package ru.amalyuhin;

import ru.amalyuhin.managers.TdbManager;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URL;

/**
 * Created with IntelliJ IDEA.
 * User: amalyuhin
 * Date: 20.04.13
 * Time: 18:03
 * To change this template use File | Settings | File Templates.
 */
public class DataServlet extends HttpServlet {
    private final String BASE_DIR = getServletContext().getRealPath("/");

    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        final String dataDir = "/data/";
        String fileName = "Thesaurus.owl";

        URL tdbUrl = this.getClass().getClassLoader().getResource("/tdb");

        resp.getOutputStream().print(tdbUrl.toString());
    }

    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        final String dataDir = "/data/";
        String fileName = "wine.owl";

        try {
            String tdbDir = BASE_DIR + "tdb";

            TdbManager tdbManager = new TdbManager(tdbDir);
            tdbManager.addNamedModel(dataDir + fileName);
            tdbManager.close();

            resp.getOutputStream().println("Ok!");

        } catch (Exception e) {
            resp.getOutputStream().println(e.getMessage());
        }
    }
}
