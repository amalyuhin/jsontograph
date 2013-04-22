package ru.amalyuhin.utils;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

import java.util.List;
import java.util.Map;

/**
 * Created with IntelliJ IDEA.
 * User: amalyuhin
 * Date: 21.04.13
 * Time: 20:00
 * To change this template use File | Settings | File Templates.
 */
public class JSONExtendedObject extends JSONObject {

    public void put(String key, List<Object> items) {
        JSONArray jsonArr = new JSONArray();

        for (Object item : items) {
            jsonArr.add(item);
        }

        super.put(key, jsonArr);
    }

    public void put(String key, Map<String, Object> map) {
        JSONArray jsonArr = new JSONArray();

        for (String k: map.keySet()) {
            JSONObject obj = new JSONObject();
            obj.put(key, map.get(k));

            jsonArr.add(obj);
        }

        super.put(key, jsonArr);
    }
}
